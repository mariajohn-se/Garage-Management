import { Request, Response, NextFunction } from 'express';
import { messageService } from '../services/MessageService';

export class MessageController {
  async unreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ count: await messageService.unreadCount(req.user!.username) });
    } catch (err) {
      next(err);
    }
  }

  async inbox(req: Request, res: Response, next: NextFunction) {
    try {
      const unreadOnly = req.query.unreadOnly === 'true';
      res.json(await messageService.inbox(req.user!.username, unreadOnly));
    } catch (err) {
      next(err);
    }
  }

  async send(req: Request, res: Response, next: NextFunction) {
    try {
      await messageService.send(req, req.body);
      res.status(201).json({ message: 'Message sent.' });
    } catch (err) {
      next(err);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      await messageService.markRead(req, Number(req.params.id));
      res.json({ message: 'Marked as read.' });
    } catch (err) {
      next(err);
    }
  }
}

export const messageController = new MessageController();
