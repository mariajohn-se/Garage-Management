import { Request } from 'express';
import { itemRepository } from '../repositories/ItemRepository';
import { stockRepository } from '../repositories/StockRepository';
import { logUserEvent } from '../auth/userlog';
import { NotFoundError, ValidationError } from '../utils/errors';

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
}

export const inventoryService = new InventoryService();
