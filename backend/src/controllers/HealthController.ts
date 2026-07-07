import { Request, Response } from 'express';
import { checkDbHealth } from '../db/connection';

export class HealthController {
  async check(_req: Request, res: Response) {
    const dbOk = await checkDbHealth();
    res.status(dbOk ? 200 : 503).json({
      status: dbOk ? 'ok' : 'degraded',
      db: dbOk ? 'ok' : 'unreachable',
      time: new Date().toISOString()
    });
  }
}

export const healthController = new HealthController();
