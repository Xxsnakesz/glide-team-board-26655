import { Request, Response } from 'express';
import { query } from '../db';
import fs from 'fs/promises';
import path from 'path';

export const getAttachments = async (req: Request, res: Response) => {
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
      `SELECT a.*, u.name as uploaded_by_name
       FROM attachments a
       JOIN users u ON a.uploaded_by = u.id
       WHERE a.card_id = $1
       ORDER BY a.uploaded_at DESC`,
      [cardId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get attachments error:', error);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
};

export const uploadAttachment = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const cardId = parseInt(req.body.cardId);
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
      // Delete uploaded file if access denied
      await fs.unlink(file.path);
      return res.status(403).json({ error: 'Access denied' });
    }

    const fileUrl = `/uploads/${file.filename}`;
    const result = await query(
      `INSERT INTO attachments (file_name, file_url, file_type, card_id, uploaded_by) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [file.originalname, fileUrl, file.mimetype, cardId, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Upload attachment error:', error);
    // Clean up file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    res.status(500).json({ error: 'Failed to upload attachment' });
  }
};

export const deleteAttachment = async (req: Request, res: Response) => {
  try {
    const attachmentId = parseInt(req.params.id);
    const userId = (req.session as any)?.userId;

    // Get attachment and check access
    const result = await query(
      `SELECT a.file_url FROM attachments a
       JOIN cards c ON a.card_id = c.id
       JOIN lists l ON c.list_id = l.id
       JOIN boards b ON l.board_id = b.id
       WHERE a.id = $1 AND (a.uploaded_by = $2 OR b.owner_id = $2)`,
      [attachmentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const fileUrl = result.rows[0].file_url;
    const filePath = path.join(process.cwd(), fileUrl);

    // Delete from database
    await query('DELETE FROM attachments WHERE id = $1', [attachmentId]);

    // Delete file from filesystem
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('File deletion error:', error);
    }

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
};
