import { queryView, queryViewPaginated, executeWrite } from '../db/callProcedure';
import { Item } from '../models/Stock';

/** VERIFIED against the live ItemsSql view (49564 real rows, "CatDescr" for category). */
export interface ItemLookup {
  itemCode: string;
  description: string | null;
  salesRate: number | null;
  stock: number | null;
}

interface ItemLookupRow {
  ItemCode: string;
  Description: string | null;
  Srate: number | null;
  Stock: number | null;
}

interface ItemRow {
  ItemCode: string;
  Description: string | null;
  CatDescr: string | null;
  Denom: string | null;
  Srate: number | null;
  Cost: number | null;
  Stock: number | null;
  ReOrder: number | null;
  Active: number | null;
}

function toItem(row: ItemRow): Item {
  return {
    itemCode: row.ItemCode,
    description: row.Description,
    category: row.CatDescr,
    denom: row.Denom,
    salesRate: row.Srate,
    cost: row.Cost,
    stock: row.Stock,
    reorderLevel: row.ReOrder,
    isActive: (row.Active ?? 1) !== 0
  };
}

const SELECT_COLUMNS = `ItemCode, Description, CatDescr, Denom, Srate, Cost, Stock, ReOrder, Active`;

export class ItemRepository {
  async search(query: string): Promise<ItemLookup[]> {
    const rows = await queryView<ItemLookupRow>(
      `SELECT TOP 20 ItemCode, Description, Srate, Stock
       FROM ItemsSql
       WHERE (ItemCode LIKE @q OR Description LIKE @q) AND (Active = 1 OR Active IS NULL)
       ORDER BY Description`,
      { q: `%${query}%` }
    );
    return rows.map((r) => ({
      itemCode: r.ItemCode,
      description: r.Description,
      salesRate: r.Srate,
      stock: r.Stock
    }));
  }

  async list(filters: {
    search?: string;
    category?: string;
    lowStock?: boolean;
    page: number;
    limit: number;
  }): Promise<{ items: Item[]; total: number }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.search) {
      conditions.push('(ItemCode LIKE @search OR Description LIKE @search)');
      params.search = `%${filters.search}%`;
    }
    if (filters.category) {
      conditions.push('CatDescr = @category');
      params.category = filters.category;
    }
    if (filters.lowStock) {
      conditions.push('ReOrder > 0 AND Stock <= ReOrder');
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM ItemsSql ${where}`, params);
    const rows = await queryViewPaginated<ItemRow>(
      SELECT_COLUMNS,
      'ItemsSql',
      where,
      'Description',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toItem), total: totalRows[0]?.cnt ?? 0 };
  }

  async findByCode(itemCode: string): Promise<Item | null> {
    const rows = await queryView<ItemRow>(`SELECT ${SELECT_COLUMNS} FROM ItemsSql WHERE ItemCode = @itemCode`, {
      itemCode
    });
    return rows.length ? toItem(rows[0]) : null;
  }

  /** ItemsSql resolves to the real base table `Items` (PK ItemCode) - verified via its view definition. */
  async update(itemCode: string, changes: { description?: string; reorderLevel?: number }): Promise<void> {
    const sets: string[] = [];
    const params: Record<string, unknown> = { itemCode };
    if (changes.description !== undefined) { sets.push('Description = @Description'); params.Description = changes.description; }
    if (changes.reorderLevel !== undefined) { sets.push('ReOrder = @ReOrder'); params.ReOrder = changes.reorderLevel; }
    if (!sets.length) return;
    await executeWrite(`UPDATE Items SET ${sets.join(', ')} WHERE ItemCode = @itemCode`, params);
  }
}

export const itemRepository = new ItemRepository();
