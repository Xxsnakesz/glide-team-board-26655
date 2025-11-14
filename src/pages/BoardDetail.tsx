import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { BoardList } from '@/components/BoardList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { boardsApi } from '@/api/boards';
import { listsApi } from '@/api/lists';
import { cardsApi } from '@/api/cards';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { Card as CardType, List, Board } from '@/types';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { TaskCard } from '@/components/TaskCard';

const BoardDetail = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (boardId && user) {
      loadBoard();
      loadLists();
    }
  }, [boardId, user, loading, navigate]);

  const loadBoard = async () => {
    if (!boardId) return;
    try {
      const data = await boardsApi.getById(boardId);
      setBoard(data);
    } catch (error) {
      toast.error('Failed to load board');
      navigate('/dashboard');
    }
  };

  const loadLists = async () => {
    if (!boardId) return;
    try {
      const data = await listsApi.getByBoardId(boardId);

      // Load cards for each list
      const listsWithCards = await Promise.all(
        data.map(async (list) => {
          try {
            const cards = await cardsApi.getByListId(list.id);
            return { ...list, cards };
          } catch {
            return { ...list, cards: [] };
          }
        })
      );

      setLists(listsWithCards);
    } catch (error) {
      toast.error('Failed to load lists');
    }
  };

  const handleAddList = async () => {
    if (newListTitle.trim() && boardId) {
      try {
        const newList = await listsApi.create({
          title: newListTitle.trim(),
          boardId: parseInt(boardId),
          position: lists.length,
        });

        // Normalize the response to match our frontend format
        const normalizedList = {
          id: newList.id,
          title: newList.title,
          position: newList.position,
          boardId: newList.board_id || newList.boardId,
          cards: []
        };

        setLists([...lists, normalizedList]);
        setNewListTitle('');
        setIsAddingList(false);
        toast.success('List created');
      } catch (error) {
        toast.error('Failed to create list');
      }
    }
  };

  const handleAddCard = async (listId: string, title: string) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;

    const colors = ['blue', 'green', 'purple', 'yellow', 'red'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    try {
      const newCard = await cardsApi.create({
        title,
        listId: parseInt(listId),
        position: list.cards.length,
        color: randomColor,
      });

      setLists(lists.map(l =>
        l.id === listId ? { ...l, cards: [...l.cards, newCard] } : l
      ));
      toast.success('Card created');
    } catch (error) {
      toast.error('Failed to create card');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = lists
      .flatMap((list) => list.cards)
      .find((card) => card.id === active.id);
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const draggedCard = lists
      .flatMap((list) => list.cards)
      .find((card) => card.id === active.id);

    if (!draggedCard) return;

    const sourceList = lists.find((list) => list.id === draggedCard.listId);
    const destList = lists.find((list) => list.id === over.id);

    if (!sourceList || !destList) return;

    if (sourceList.id !== destList.id) {
      const newPosition = destList.cards.length;

      // Optimistic update
      const newLists = lists.map(list => {
        if (list.id === sourceList.id) {
          return { ...list, cards: list.cards.filter(c => c.id !== draggedCard.id) };
        }
        if (list.id === destList.id) {
          return { ...list, cards: [...list.cards, { ...draggedCard, listId: destList.id, position: newPosition }] };
        }
        return list;
      });
      setLists(newLists);

      // API call
      try {
        await cardsApi.move(draggedCard.id, {
          listId: destList.id,
          position: newPosition,
        });
        toast.success('Card moved');
      } catch (error) {
        toast.error('Failed to move card');
        // Revert on error
        loadLists();
      }
    }
  };

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Board not found</h1>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="border-b bg-card px-4 py-3">
        <div className="container mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{board.title}</h1>
        </div>
      </div>

      <main className="flex-1 overflow-x-auto">
        <div className="container mx-auto px-4 py-6">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 pb-4">
              {lists
                .filter((list) => list.boardId === boardId)
                .map((list) => (
                  <BoardList
                    key={list.id}
                    list={list}
                    onAddCard={(title) => handleAddCard(list.id, title)}
                  />
                ))}

              {isAddingList ? (
                <div className="min-w-[280px] max-w-[280px] bg-muted rounded-lg p-3">
                  <Input
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="Enter list title..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddList();
                      if (e.key === 'Escape') setIsAddingList(false);
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <Button onClick={handleAddList} size="sm">
                      Add List
                    </Button>
                    <Button
                      onClick={() => setIsAddingList(false)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setIsAddingList(true)}
                  variant="ghost"
                  className="min-w-[280px] max-w-[280px] h-fit bg-muted/50 hover:bg-muted"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add another list
                </Button>
              )}
            </div>
            <DragOverlay>
              {activeCard ? <TaskCard card={activeCard} /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      </main>
    </div>
  );
};

export default BoardDetail;