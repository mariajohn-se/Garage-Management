import { Request } from 'express';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { logUserEvent } from '../auth/userlog';
import { ValidationError, NotFoundError } from '../utils/errors';
import { Vehicle } from '../models/Party';

export class VehicleService {
  async list(filters: { search?: string; page: number; limit: number }) {
    return vehicleRepository.list(filters);
  }

  async get(vehId: number): Promise<Vehicle> {
    const vehicle = await vehicleRepository.findById(vehId);
    if (!vehicle) throw new NotFoundError('Vehicle not found.');
    return vehicle;
  }

  async create(req: Request, input: Omit<Vehicle, 'vehId'>): Promise<number> {
    if (!input.vehNo?.trim()) throw new ValidationError('Registration number is required.');
    const vehId = await vehicleRepository.create(input);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Vehicle Created',
      remarks: `Created vehicle ${input.vehNo}`
    });
    return vehId;
  }

  async update(req: Request, vehId: number, changes: Partial<Omit<Vehicle, 'vehId'>>): Promise<void> {
    const existing = await vehicleRepository.findById(vehId);
    if (!existing) throw new NotFoundError('Vehicle not found.');
    await vehicleRepository.update(vehId, changes);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Vehicle Updated',
      remarks: `Updated vehicle ${vehId}: ${JSON.stringify(changes)}`
    });
  }

  async delete(req: Request, vehId: number): Promise<void> {
    const existing = await vehicleRepository.findById(vehId);
    if (!existing) throw new NotFoundError('Vehicle not found.');
    await vehicleRepository.delete(vehId);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Vehicle Deleted',
      remarks: `Deleted vehicle ${vehId}`
    });
  }
}

export const vehicleService = new VehicleService();
