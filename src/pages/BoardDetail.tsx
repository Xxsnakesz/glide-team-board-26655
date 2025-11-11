import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { BoardList } from '@/components/BoardList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store/useStore';
import { Plus, X, ArrowLeft } from 'lucide-react';
import type { Card as CardType, List } from '@/types';
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
  const boards = useStore((state) => state.boards);
  const lists = useStore((state) => state.lists);
  const setLists = useStore((state) => state.setLists);
  const addList = useStore((state) => state.addList);
  const addCard = useStore((state) => state.addCard);
  const moveCard = useStore((state) => state.moveCard);

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  const board = boards.find((b) => b.id === boardId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (boardId === '1') {
      // Load mock data for board 1
      const mockLists: List[] = [
        {
          id: '1',
          title: 'To Do',
          position: 0,
          boardId: '1',
          cards: [
            {
              id: '1',
              title: 'Design landing page',
              description: 'Create a modern, responsive landing page',
              position: 0,
              listId: '1',
              color: 'blue',
            },
            {
              id: '2',
              title: 'Set up analytics',
              description: 'Configure Google Analytics and tracking',
              position: 1,
              listId: '1',
              color: 'green',
            },
          ],
        },
        {
          id: '2',
          title: 'In Progress',
          position: 1,
          boardId: '1',
          cards: [
            {
              id: '3',
              title: 'Implement authentication',
              description: 'Add Google OAuth integration',
              position: 0,
              listId: '2',
              color: 'yellow',
            },
          ],
        },
        {
          id: '3',
          title: 'Done',
          position: 2,
          boardId: '1',
          cards: [
            {
              id: '4',
              title: 'Project setup',
              description: 'Initialize project with React and TypeScript',
              position: 0,
              listId: '3',
              color: 'purple',
            },
          ],
        },
      ];
      setLists(mockLists);
    }
  }, [boardId, setLists]);

  const handleAddList = () => {
    if (newListTitle.trim() && boardId) {
      const newList: List = {
        id: Date.now().toString(),
        title: newListTitle.trim(),
        position: lists.length,
        boardId,
        cards: [],
      };
      addList(newList);
      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  const handleAddCard = (listId: string, title: string) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;

    const colors = ['blue', 'green', 'purple', 'yellow', 'red'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newCard: CardType = {
      id: Date.now().toString(),
      title,
      position: list.cards.length,
      listId,
      color: randomColor,
    };
    addCard(listId, newCard);
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeCard = lists
      .flatMap((list) => list.cards)
      .find((card) => card.id === active.id);
    
    if (!activeCard) return;

    const sourceList = lists.find((list) => list.id === activeCard.listId);
    const destList = lists.find((list) => list.id === over.id);

    if (!sourceList || !destList) return;

    if (sourceList.id !== destList.id) {
      moveCard(activeCard.id, sourceList.id, destList.id, destList.cards.length);
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
