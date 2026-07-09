import { Request } from 'express';
import { bookingRepository } from '../repositories/BookingRepository';
import { logUserEvent } from '../auth/userlog';
import { ValidationError } from '../utils/errors';
import { BookingInput } from '../models/Booking';

export class BookingService {
  async list(filters: { page: number; limit: number }) {
    return bookingRepository.list(filters);
  }

  async create(req: Request, input: BookingInput): Promise<{ id: number }> {
    if (!input.customerId?.trim()) throw new ValidationError('Customer is required.');
    if (!input.vehicleId) throw new ValidationError('Vehicle is required.');
    if (!input.staffId?.trim()) throw new ValidationError('Advisor is required.');
    if (!input.appDate) throw new ValidationError('Appointment date is required.');

    const staffExists = await bookingRepository.staffExists(input.staffId);
    if (!staffExists) {
      throw new ValidationError('Selected advisor was not found - please pick one from the search results.');
    }

    const id = await bookingRepository.create(input, req.user!.username);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Vehicle Booking Created',
      remarks: `Booked ${input.vehNo ?? input.vehicleId} for customer ${input.customerId} on ${input.appDate}`
    });
    return { id };
  }
}

export const bookingService = new BookingService();
