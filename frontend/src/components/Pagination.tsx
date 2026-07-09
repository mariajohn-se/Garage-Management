const PAGE_SIZE_OPTIONS = [50, 100, 250, 500];

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function Pagination({ page, limit, total, onPageChange, onLimitChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        marginTop: 'var(--space-4)',
        flexWrap: 'wrap'
      }}
    >
      <button className="btn-outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Prev
      </button>
      <span style={{ fontSize: 'var(--text-sm-size)', color: 'var(--color-text-secondary)' }}>
        Page {page} of {totalPages} ({total} total)
      </span>
      <button className="btn-outline" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
      {onLimitChange && (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-sm-size)',
            color: 'var(--color-text-secondary)',
            marginLeft: 'auto'
          }}
        >
          Rows per page
          <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
