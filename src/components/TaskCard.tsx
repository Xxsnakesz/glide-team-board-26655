import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Card as CardType } from '@/types';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MessageSquare, Paperclip } from 'lucide-react';

interface TaskCardProps {
  card: CardType;
}

const colorClasses = {
  blue: 'border-l-4 border-l-primary',
  green: 'border-l-4 border-l-success',
  purple: 'border-l-4 border-l-secondary',
  yellow: 'border-l-4 border-l-warning',
  red: 'border-l-4 border-l-destructive',
};

export const TaskCard = ({ card }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const colorClass = colorClasses[card.color as keyof typeof colorClasses] || '';

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={`p-3 cursor-pointer hover:shadow-md transition-shadow bg-card ${colorClass}`}>
        <h4 className="font-medium text-card-foreground mb-2">{card.title}</h4>
        {card.description && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {card.description}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {card.dueDate && (
            <Badge variant="secondary" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(card.dueDate).toLocaleDateString()}
            </Badge>
          )}
          <div className="flex items-center text-xs text-muted-foreground gap-3">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              0
            </span>
            <span className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              0
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
