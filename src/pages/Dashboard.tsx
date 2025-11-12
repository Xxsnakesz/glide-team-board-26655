import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { BoardCard } from '@/components/BoardCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { boardsApi } from '@/api/boards';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Board } from '@/types';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  
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

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      loadBoards();
    }
  }, [user, loading, navigate]);

  const loadBoards = async () => {
    try {
      const data = await boardsApi.getAll();
      setBoards(data);
    } catch (error) {
      toast.error('Failed to load boards');
    }
  };

  const handleCreateBoard = async () => {
    if (newBoardTitle.trim()) {
      try {
        const newBoard = await boardsApi.create({
          title: newBoardTitle.trim(),
          color: selectedColor,
        });
        setBoards([...boards, newBoard]);
        setNewBoardTitle('');
        setSelectedColor('blue');
        setIsDialogOpen(false);
        toast.success('Board created successfully');
      } catch (error) {
        toast.error('Failed to create board');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

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
