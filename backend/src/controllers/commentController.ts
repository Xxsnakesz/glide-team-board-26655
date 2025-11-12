import { Request, Response } from 'express';
import { query } from '../db';
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(1).max(2000),
  cardId: z.number(),
});

export const getComments = async (req: Request, res: Response) => {
  try {
    const cardId = parseInt(req.params.cardId);
    const userId = (req.session as any)?.userId;

    // Check access
    const accessCheck = await query(
      `SELECT 1 FROM cards c
       JOIN lists l ON c.list_id = l.id
       JOIN boards b ON l.board_id = b.id
       LEFT JOIN board_members bm ON b.id = bm.board_id
       WHERE c.id = $1 AND (b.owner_id = $2 OR bm.user_id = $2)`,
      [cardId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await query(
      `SELECT c.*, u.name as user_name, u.avatar as user_avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.card_id = $1
       ORDER BY c.created_at DESC`,
      [cardId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const { content, cardId } = commentSchema.parse(req.body);
    const userId = (req.session as any)?.userId;

    // Check access
    const accessCheck = await query(
      `SELECT 1 FROM cards c
       JOIN lists l ON c.list_id = l.id
       JOIN boards b ON l.board_id = b.id
       LEFT JOIN board_members bm ON b.id = bm.board_id
       WHERE c.id = $1 AND (b.owner_id = $2 OR bm.user_id = $2)`,
      [cardId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await query(
      `INSERT INTO comments (content, user_id, card_id) 
       VALUES ($1, $2, $3) RETURNING *`,
      [content, userId, cardId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.id);
    const userId = (req.session as any)?.userId;

    // Can delete own comments or if board owner
    const result = await query(
      `DELETE FROM comments c
       USING cards ca, lists l, boards b
       WHERE c.id = $1 
       AND c.card_id = ca.id
       AND ca.list_id = l.id
       AND l.board_id = b.id
       AND (c.user_id = $2 OR b.owner_id = $2)
       RETURNING c.id`,
      [commentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
