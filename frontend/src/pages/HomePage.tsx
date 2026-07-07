import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { customerApi, supplierApi, vehicleApi } from '../api/partyApi';
import { inventoryApi } from '../api/inventoryApi';
import { orderApi } from '../api/salesApi';
import { bankingApi } from '../api/bankingApi';
import { receiptsPaymentsApi } from '../api/receiptsPaymentsApi';

interface DashboardTile {
  key: string;
  label: string;
  to: string;
  tone?: 'warning';
  fetchTotal: () => Promise<number>;
  requires?: 'privileged';
}

const TILES: DashboardTile[] = [
  {
    key: 'customers',
    label: 'Customers',
    to: '/customers',
    fetchTotal: () => customerApi.list({ page: 1, limit: 1 }).then((r) => r.total)
  },
  {
    key: 'suppliers',
    label: 'Suppliers',
    to: '/suppliers',
    fetchTotal: () => supplierApi.list({ page: 1, limit: 1 }).then((r) => r.total)
  },
  {
    key: 'vehicles',
    label: 'Vehicles',
    to: '/vehicles',
    fetchTotal: () => vehicleApi.list({ page: 1, limit: 1 }).then((r) => r.total)
  },
  {
    key: 'items',
    label: 'Items',
    to: '/inventory/items',
    fetchTotal: () => inventoryApi.listItems({ page: 1, limit: 1 }).then((r) => r.total)
  },
  {
    key: 'low-stock',
    label: 'Items Below Reorder Level',
    to: '/inventory/reorder-status',
    tone: 'warning',
    fetchTotal: () => inventoryApi.reorderStatus({ page: 1, limit: 1 }).then((r) => r.total)
  },
  {
    key: 'orders',
    label: 'Sales Orders',
    to: '/orders',
    fetchTotal: () => orderApi.list({ page: 1, limit: 1 }).then((r) => r.total)
  },
  {
    key: 'vouchers',
    label: 'Vouchers',
    to: '/banking/vouchers',
    fetchTotal: () => bankingApi.listVouchers({ page: 1, limit: 1 }).then((r) => r.total)
  },
  {
    key: 'receipts-outstanding',
    label: 'Outstanding Receipts',
    to: '/receipts',
    tone: 'warning',
    requires: 'privileged',
    fetchTotal: () =>
      receiptsPaymentsApi.listReceipts({ status: 'outstanding', page: 1, limit: 1 }).then((r) => r.total)
  },
  {
    key: 'payments-outstanding',
    label: 'Outstanding Payments',
    to: '/payments',
    tone: 'warning',
    requires: 'privileged',
    fetchTotal: () =>
      receiptsPaymentsApi.listPayments({ status: 'outstanding', page: 1, limit: 1 }).then((r) => r.total)
  }
];

type TileState = Record<string, { value: number | null; error: boolean }>;

export function HomePage() {
  const { session } = useAuth();
  const isPrivileged = !!session?.roles.some((r) => r === 'Supervisor' || r === 'Administrator');
  const [tileState, setTileState] = useState<TileState>({});
  const [loading, setLoading] = useState(true);

  const visibleTiles = TILES.filter((tile) => tile.requires !== 'privileged' || isPrivileged);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.allSettled(visibleTiles.map((tile) => tile.fetchTotal())).then((results) => {
      if (cancelled) return;
      const next: TileState = {};
      results.forEach((result, i) => {
        next[visibleTiles[i].key] = {
          value: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected'
        };
      });
      setTileState(next);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPrivileged]);

  return (
    <div data-testid="home-page">
      <div className="section-card home-welcome">
        <h2>Welcome, {session?.username}</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
          {session?.roles.join(', ')} &middot; live snapshot from the real database. Use the menu on the left to
          navigate to any module.
        </p>
      </div>

      <div className="home-kpi-grid">
        {visibleTiles.map((tile) => {
          const state = tileState[tile.key];
          return (
            <Link
              key={tile.key}
              to={tile.to}
              className={`home-kpi-tile ${tile.tone === 'warning' ? 'is-warning' : ''}`}
            >
              <span className="home-kpi-value">
                {loading ? (
                  <span className="home-kpi-skeleton" />
                ) : state?.error ? (
                  <span className="home-kpi-error">&mdash;</span>
                ) : (
                  (state?.value ?? 0).toLocaleString()
                )}
              </span>
              <span className="home-kpi-label">{tile.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
