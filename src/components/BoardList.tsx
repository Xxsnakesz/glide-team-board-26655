import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { List } from '@/types';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface BoardListProps {
  list: List;
  onAddCard: (title: string) => void;
}

export const BoardList = ({ list, onAddCard }: BoardListProps) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const { setNodeRef } = useDroppable({
    id: list.id,
  });

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  return (
    <Card className="bg-muted min-w-[280px] max-w-[280px] p-3 flex flex-col gap-2 h-fit">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{list.title}</h3>
      </div>

      <div ref={setNodeRef} className="flex flex-col gap-2 min-h-[100px]">
        <SortableContext items={list.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <TaskCard key={card.id} card={card} />
          ))}
        </SortableContext>
      </div>

      {isAddingCard ? (
        <div className="space-y-2">
          <Input
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="Enter card title..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCard();
              if (e.key === 'Escape') setIsAddingCard(false);
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <Button onClick={handleAddCard} size="sm">
              Add
            </Button>
            <Button onClick={() => setIsAddingCard(false)} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsAddingCard(true)}
          variant="ghost"
          className="justify-start text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add a card
        </Button>
      )}
    </Card>
  );
};
