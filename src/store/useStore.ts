import { create } from 'zustand';
import type { Board, List, Card, User } from '@/types';

interface AppState {
  user: User | null;
  boards: Board[];
  currentBoard: Board | null;
  lists: List[];
  setUser: (user: User | null) => void;
  setBoards: (boards: Board[]) => void;
  addBoard: (board: Board) => void;
  setCurrentBoard: (board: Board | null) => void;
  setLists: (lists: List[]) => void;
  addList: (list: List) => void;
  updateList: (listId: string, updates: Partial<List>) => void;
  addCard: (listId: string, card: Card) => void;
  updateCard: (listId: string, cardId: string, updates: Partial<Card>) => void;
  moveCard: (cardId: string, sourceListId: string, destListId: string, newPosition: number) => void;
  deleteCard: (listId: string, cardId: string) => void;
}

// Mock data for development
const mockBoards: Board[] = [
  {
    id: '1',
    title: 'Product Launch',
    ownerId: '1',
    createdAt: new Date().toISOString(),
    color: 'blue',
  },
  {
    id: '2',
    title: 'Marketing Campaign',
    ownerId: '1',
    createdAt: new Date().toISOString(),
    color: 'green',
  },
  {
    id: '3',
    title: 'Development Roadmap',
    ownerId: '1',
    createdAt: new Date().toISOString(),
    color: 'purple',
  },
];

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

export const useStore = create<AppState>((set) => ({
  user: {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  },
  boards: mockBoards,
  currentBoard: null,
  lists: [],
  
  setUser: (user) => set({ user }),
  
  setBoards: (boards) => set({ boards }),
  
  addBoard: (board) => set((state) => ({ boards: [...state.boards, board] })),
  
  setCurrentBoard: (board) => set({ currentBoard: board }),
  
  setLists: (lists) => set({ lists }),
  
  addList: (list) => set((state) => ({ lists: [...state.lists, list] })),
  
  updateList: (listId, updates) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId ? { ...list, ...updates } : list
      ),
    })),
  
  addCard: (listId, card) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId
          ? { ...list, cards: [...list.cards, card] }
          : list
      ),
    })),
  
  updateCard: (listId, cardId, updates) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              cards: list.cards.map((card) =>
                card.id === cardId ? { ...card, ...updates } : card
              ),
            }
          : list
      ),
    })),
  
  moveCard: (cardId, sourceListId, destListId, newPosition) =>
    set((state) => {
      const newLists = [...state.lists];
      const sourceList = newLists.find((l) => l.id === sourceListId);
      const destList = newLists.find((l) => l.id === destListId);
      
      if (!sourceList || !destList) return state;
      
      const cardIndex = sourceList.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return state;
      
      const [card] = sourceList.cards.splice(cardIndex, 1);
      card.listId = destListId;
      card.position = newPosition;
      
      destList.cards.splice(newPosition, 0, card);
      
      return { lists: newLists };
    }),
  
  deleteCard: (listId, cardId) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId
          ? { ...list, cards: list.cards.filter((c) => c.id !== cardId) }
          : list
      ),
    })),
}));
