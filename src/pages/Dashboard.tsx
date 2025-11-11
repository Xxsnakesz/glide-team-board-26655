import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { BoardCard } from '@/components/BoardCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useStore } from '@/store/useStore';
import { Plus } from 'lucide-react';
import type { Board } from '@/types';

const Dashboard = () => {
  const boards = useStore((state) => state.boards);
  const addBoard = useStore((state) => state.addBoard);
  const user = useStore((state) => state.user);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('blue');

  const colors = [
    { name: 'blue', class: 'bg-card-blue' },
    { name: 'green', class: 'bg-card-green' },
    { name: 'purple', class: 'bg-card-purple' },
    { name: 'yellow', class: 'bg-card-yellow' },
    { name: 'red', class: 'bg-card-red' },
  ];

  const handleCreateBoard = () => {
    if (newBoardTitle.trim() && user) {
      const newBoard: Board = {
        id: Date.now().toString(),
        title: newBoardTitle.trim(),
        ownerId: user.id,
        createdAt: new Date().toISOString(),
        color: selectedColor,
      };
      addBoard(newBoard);
      setNewBoardTitle('');
      setSelectedColor('blue');
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Your Boards</h1>
            <p className="text-muted-foreground">Manage all your projects in one place</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Board
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Board</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Input
                    placeholder="Board title"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Choose a color</label>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-12 h-12 rounded-lg ${color.class} transition-transform ${
                          selectedColor === color.name ? 'ring-2 ring-primary scale-110' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateBoard} className="w-full">
                  Create Board
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
