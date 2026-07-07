import { Request, Response, NextFunction } from 'express';
import { itemRepository } from '../repositories/ItemRepository';

export class ItemController {
  async help(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      res.json(await itemRepository.search((q as string | undefined) ?? ''));
    } catch (err) {
      next(err);
    }
  }
}

export const itemController = new ItemController();
