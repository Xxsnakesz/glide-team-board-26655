export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  googleId?: string;
}

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  color?: string;
}

export interface List {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  listId: string;
  dueDate?: string;
  color?: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  cardId: string;
  createdAt: string;
  user?: User;
}

export interface Attachment {
  id: string;
  fileUrl: string;
  cardId: string;
  uploadedAt: string;
}
