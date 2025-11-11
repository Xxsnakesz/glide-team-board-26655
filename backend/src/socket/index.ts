import { Server } from 'socket.io';

export const setupSocketIO = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-board', (boardId: string) => {
      socket.join(`board-${boardId}`);
      console.log(`Socket ${socket.id} joined board ${boardId}`);
    });

    socket.on('leave-board', (boardId: string) => {
      socket.leave(`board-${boardId}`);
      console.log(`Socket ${socket.id} left board ${boardId}`);
    });

    socket.on('card-update', (data) => {
      socket.to(`board-${data.boardId}`).emit('card-updated', data);
    });

    socket.on('card-move', (data) => {
      socket.to(`board-${data.boardId}`).emit('card-moved', data);
    });

    socket.on('list-update', (data) => {
      socket.to(`board-${data.boardId}`).emit('list-updated', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
