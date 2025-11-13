import { Request, Response, NextFunction } from 'express';
import { query } from '../db';

export const logActivity = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.session as any)?.userId;
    
    if (userId) {
      try {
        await query(
          'INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
          [
            userId,
            action,
            JSON.stringify({
              method: req.method,
              path: req.path,
              body: req.body,
              query: req.query,
            }),
            req.ip,
            req.get('user-agent'),
          ]
        );
      } catch (error) {
        console.error('Activity logging failed:', error);
        // Don't block the request if logging fails
      }
    }
    
    next();
  };
};
