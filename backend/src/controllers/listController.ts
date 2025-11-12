import { Request, Response } from 'express';
import { query } from '../db';
import { z } from 'zod';

const listSchema = z.object({
  title: z.string().min(1).max(255),
  boardId: z.number(),
  position: z.number().optional(),
});

export const getLists = async (req: Request, res: Response) => {
  try {
    const boardId = parseInt(req.params.boardId);
    const userId = (req.session as any)?.userId;

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

    const result = await query(
      'SELECT * FROM lists WHERE board_id = $1 ORDER BY position',
      [boardId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
};

export const createList = async (req: Request, res: Response) => {
  try {
    const { title, boardId, position } = listSchema.parse(req.body);
    const userId = (req.session as any)?.userId;

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

    // Get max position if not provided
    let finalPosition = position;
    if (finalPosition === undefined) {
      const maxPos = await query(
        'SELECT COALESCE(MAX(position), -1) as max_position FROM lists WHERE board_id = $1',
        [boardId]
      );
      finalPosition = maxPos.rows[0].max_position + 1;
    }

    const result = await query(
      'INSERT INTO lists (title, board_id, position) VALUES ($1, $2, $3) RETURNING *',
      [title, boardId, finalPosition]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create list error:', error);
    res.status(500).json({ error: 'Failed to create list' });
  }
};

export const updateList = async (req: Request, res: Response) => {
  try {
    const listId = parseInt(req.params.id);
    const { title, position } = req.body;
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

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (position !== undefined) {
      updates.push(`position = $${paramCount++}`);
      values.push(position);
    }

    values.push(listId);
    const result = await query(
      `UPDATE lists SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ error: 'Failed to update list' });
  }
};

export const deleteList = async (req: Request, res: Response) => {
  try {
    const listId = parseInt(req.params.id);
    const userId = (req.session as any)?.userId;

    const accessCheck = await query(
      `SELECT 1 FROM lists l
       JOIN boards b ON l.board_id = b.id
       WHERE l.id = $1 AND b.owner_id = $2`,
      [listId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only owner can delete lists' });
    }

    await query('DELETE FROM lists WHERE id = $1', [listId]);
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
};
