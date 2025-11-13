import { Request, Response } from 'express';
import { query } from '../db';
import { z } from 'zod';

const cardSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  listId: z.number(),
  position: z.number().optional(),
  color: z.string().optional(),
  dueDate: z.string().optional(),
});

export const getCards = async (req: Request, res: Response) => {
  try {
    const listId = parseInt(req.params.listId);
    const userId = (req.session as any)?.userId;

    // Check access via board
    const accessCheck = await query(
      `SELECT 1 FROM lists l
       JOIN boards b ON l.board_id = b.id
       LEFT JOIN board_members bm ON b.id = bm.board_id
       WHERE l.id = $1 AND (b.owner_id = $2 OR bm.user_id = $2)`,
      [listId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await query(
      'SELECT * FROM cards WHERE list_id = $1 ORDER BY position',
      [listId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
};

export const createCard = async (req: Request, res: Response) => {
  try {
    const { title, description, listId, position, color, dueDate } = cardSchema.parse(req.body);
    const userId = (req.session as any)?.userId;

    // Check access
    const accessCheck = await query(
      `SELECT 1 FROM lists l
       JOIN boards b ON l.board_id = b.id
       LEFT JOIN board_members bm ON b.id = bm.board_id
       WHERE l.id = $1 AND (b.owner_id = $2 OR bm.user_id = $2)`,
      [listId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get max position if not provided
    let finalPosition = position;
    if (finalPosition === undefined) {
      const maxPos = await query(
        'SELECT COALESCE(MAX(position), -1) as max_position FROM cards WHERE list_id = $1',
        [listId]
      );
      finalPosition = maxPos.rows[0].max_position + 1;
    }

    const result = await query(
      `INSERT INTO cards (title, description, list_id, position, color, due_date) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, listId, finalPosition, color, dueDate]
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'create_card', JSON.stringify({ cardId: result.rows[0].id, listId, title })]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
};

export const updateCard = async (req: Request, res: Response) => {
  try {
    const cardId = parseInt(req.params.id);
    const { title, description, color, dueDate, position } = req.body;
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

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (color !== undefined) {
      updates.push(`color = $${paramCount++}`);
      values.push(color);
    }
    if (dueDate !== undefined) {
      updates.push(`due_date = $${paramCount++}`);
      values.push(dueDate);
    }
    if (position !== undefined) {
      updates.push(`position = $${paramCount++}`);
      values.push(position);
    }

    values.push(cardId);
    const result = await query(
      `UPDATE cards SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'update_card', JSON.stringify({ cardId, updates: { title, description, color, dueDate, position } })]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
};

export const moveCard = async (req: Request, res: Response) => {
  try {
    const cardId = parseInt(req.params.id);
    const { listId, position } = req.body;
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
      'UPDATE cards SET list_id = $1, position = $2 WHERE id = $3 RETURNING *',
      [listId, position, cardId]
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'move_card', JSON.stringify({ cardId, listId, position })]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Move card error:', error);
    res.status(500).json({ error: 'Failed to move card' });
  }
};

export const deleteCard = async (req: Request, res: Response) => {
  try {
    const cardId = parseInt(req.params.id);
    const userId = (req.session as any)?.userId;

    const accessCheck = await query(
      `SELECT 1 FROM cards c
       JOIN lists l ON c.list_id = l.id
       JOIN boards b ON l.board_id = b.id
       WHERE c.id = $1 AND b.owner_id = $2`,
      [cardId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only owner can delete cards' });
    }

    await query('DELETE FROM cards WHERE id = $1', [cardId]);
    
    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'delete_card', JSON.stringify({ cardId })]
    );
    
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
};
