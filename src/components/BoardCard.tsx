import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import type { Board } from '@/types';
import { motion } from 'framer-motion';

interface BoardCardProps {
  board: Board;
}

const colorClasses = {
  blue: 'bg-card-blue text-card-blue-text',
  green: 'bg-card-green text-card-green-text',
  purple: 'bg-card-purple text-card-purple-text',
  yellow: 'bg-card-yellow text-card-yellow-text',
  red: 'bg-card-red text-card-red-text',
};

export const BoardCard = ({ board }: BoardCardProps) => {
  const colorClass = colorClasses[board.color as keyof typeof colorClasses] || 'bg-card-blue text-card-blue-text';

  return (
    <Link to={`/board/${board.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Card className={`${colorClass} h-32 p-6 cursor-pointer hover:shadow-lg transition-shadow`}>
          <h3 className="text-lg font-semibold">{board.title}</h3>
        </Card>
      </motion.div>
    </Link>
  );
};
