import { Request, Response } from 'express';
import { query } from '../db';
import { z } from 'zod';

const boardSchema = z.object({
  title: z.string().min(1).max(255),
  color: z.string().optional(),
});

export const getBoards = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const result = await query(
      `SELECT DISTINCT b.* FROM boards b
       LEFT JOIN board_members bm ON b.id = bm.board_id
       WHERE b.owner_id = $1 OR bm.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
};

export const createBoard = async (req: Request, res: Response) => {
  try {
    const { title, color } = boardSchema.parse(req.body);
    const userId = (req.user as any).id;

    const result = await query(
      'INSERT INTO boards (title, color, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [title, color || 'blue', userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
};

export const getBoard = async (req: Request, res: Response) => {
  try {
    const boardId = parseInt(req.params.id);
    const userId = (req.user as any).id;

    // Check access
    const accessCheck = await query(
      `SELECT 1 FROM boards b
       LEFT JOIN board_members bm ON b.id = bm.board_id
       WHERE b.id = $1 AND (b.owner_id = $2 OR bm.user_id = $2)`,
      [boardId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await query('SELECT * FROM boards WHERE id = $1', [boardId]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
};

export const updateBoard = async (req: Request, res: Response) => {
  try {
    const boardId = parseInt(req.params.id);
    const { title, color } = boardSchema.parse(req.body);
    const userId = (req.user as any).id;

    // Check ownership
    const ownerCheck = await query(
      'SELECT 1 FROM boards WHERE id = $1 AND owner_id = $2',
      [boardId, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only owner can update board' });
    }

    const result = await query(
      'UPDATE boards SET title = $1, color = $2 WHERE id = $3 RETURNING *',
      [title, color, boardId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update board error:', error);
    res.status(500).json({ error: 'Failed to update board' });
  }
};

export const deleteBoard = async (req: Request, res: Response) => {
  try {
    const boardId = parseInt(req.params.id);
    const userId = (req.user as any).id;

    const ownerCheck = await query(
      'SELECT 1 FROM boards WHERE id = $1 AND owner_id = $2',
      [boardId, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only owner can delete board' });
    }

    await query('DELETE FROM boards WHERE id = $1', [boardId]);
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const boardId = parseInt(req.params.id);
    const { userId: newUserId, role } = req.body;
    const userId = (req.user as any).id;

    // Check if requester is owner or admin
    const ownerCheck = await query(
      'SELECT 1 FROM boards WHERE id = $1 AND owner_id = $2',
      [boardId, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only owner can add members' });
    }

    const result = await query(
      'INSERT INTO board_members (user_id, board_id, role) VALUES ($1, $2, $3) RETURNING *',
      [newUserId, boardId, role || 'member']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    const boardId = parseInt(req.params.id);
    const removeUserId = parseInt(req.params.userId);
    const userId = (req.user as any).id;

    const ownerCheck = await query(
      'SELECT 1 FROM boards WHERE id = $1 AND owner_id = $2',
      [boardId, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only owner can remove members' });
    }

    await query(
      'DELETE FROM board_members WHERE board_id = $1 AND user_id = $2',
      [boardId, removeUserId]
    );

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};
