import { Request } from 'express';
import { itemRepository } from '../repositories/ItemRepository';
import { stockRepository } from '../repositories/StockRepository';
import { logUserEvent } from '../auth/userlog';
import { NotFoundError, ValidationError } from '../utils/errors';
import { StockMovementInput } from '../models/Stock';

export class InventoryService {
  async listItems(filters: { search?: string; category?: string; lowStock?: boolean; page: number; limit: number }) {
    return itemRepository.list(filters);
  }

  async getItem(itemCode: string) {
    const item = await itemRepository.findByCode(itemCode);
    if (!item) throw new NotFoundError('Item not found.');
    return item;
  }

  /** BR-77: item edits are RBAC-gated at the route (Supervisor/Administrator). */
  async updateItem(
    req: Request,
    itemCode: string,
    changes: { description?: string; reorderLevel?: number }
  ): Promise<void> {
    const existing = await itemRepository.findByCode(itemCode);
    if (!existing) throw new NotFoundError('Item not found.');
    if (changes.reorderLevel !== undefined && changes.reorderLevel < 0) {
      throw new ValidationError('Reorder level cannot be negative.');
    }
    await itemRepository.update(itemCode, changes);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Item Updated',
      remarks: `Updated item ${itemCode}: ${JSON.stringify(changes)}`
    });
  }

  async listStockIn(filters: { page: number; limit: number }) {
    return stockRepository.listStockIn(filters);
  }

  async listStockOut(filters: { page: number; limit: number }) {
    return stockRepository.listStockOut(filters);
  }

  async listTransactions(filters: { itemCode?: string; page: number; limit: number }) {
    return stockRepository.listTransactions(filters);
  }

  async currentStock(filters: { search?: string; page: number; limit: number }) {
    return stockRepository.currentStock(filters);
  }

  async stockValuation(asOfDate: string, type: '0' | '1') {
    if (!asOfDate) throw new ValidationError('asOfDate is required.');
    return stockRepository.stockValuation(asOfDate, type);
  }

  async stockAging(asOfDate: string, days: number, type: '0' | '1') {
    if (!asOfDate) throw new ValidationError('asOfDate is required.');
    return stockRepository.stockAging(asOfDate, days, type);
  }

  async reorderStatus(filters: { page: number; limit: number }) {
    return stockRepository.reorderStatus(filters);
  }

  async stockMovementFrequency(fromDate: string, toDate: string, direction: 'fast' | 'slow', limit: number) {
    if (!fromDate || !toDate) throw new ValidationError('fromDate and toDate are required.');
    return stockRepository.stockMovementFrequency(fromDate, toDate, direction, limit);
  }

  async listGodowns() {
    return stockRepository.listGodowns();
  }

  private validateMovement(input: StockMovementInput): void {
    if (!input.stockDate) throw new ValidationError('Stock date is required.');
    if (!input.lines?.length) throw new ValidationError('At least one line item is required.');
    for (const line of input.lines) {
      if (!line.itemCode?.trim()) throw new ValidationError('Every line requires an item.');
      if (!line.qty || line.qty <= 0) throw new ValidationError('Every line requires a quantity greater than zero.');
      if (!line.godownId?.trim()) throw new ValidationError('Every line requires a location.');
    }
  }

  async createStockIn(req: Request, input: StockMovementInput) {
    this.validateMovement(input);
    const result = await stockRepository.createStockIn(input);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Stock In Created',
      remarks: `Stock in ${result.stockNo}, ${input.lines.length} line(s)`
    });
    return result;
  }

  async createStockOut(req: Request, input: StockMovementInput) {
    this.validateMovement(input);
    const result = await stockRepository.createStockOut(input);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Stock Out Created',
      remarks: `Stock out ${result.stockNo}, ${input.lines.length} line(s)`
    });
    return result;
  }
}

export const inventoryService = new InventoryService();
