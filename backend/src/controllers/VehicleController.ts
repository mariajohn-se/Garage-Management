import { Request, Response, NextFunction } from 'express';
import { vehicleService } from '../services/VehicleService';

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 25));
  return { page, limit };
}

export class VehicleController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;
      const result = await vehicleService.list({ search: search as string | undefined, ...parsePaging(req) });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await vehicleService.get(Number(req.params.id)));
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const vehId = await vehicleService.create(req, req.body ?? {});
      res.status(201).json({ vehId });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      await vehicleService.update(req, Number(req.params.id), req.body ?? {});
      res.json({ message: 'Vehicle updated.' });
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await vehicleService.delete(req, Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const vehicleController = new VehicleController();
