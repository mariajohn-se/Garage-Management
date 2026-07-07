interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, limit, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
      <button className="btn-outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Prev
      </button>
      <span style={{ fontSize: 'var(--text-sm-size)', color: 'var(--color-text-secondary)' }}>
        Page {page} of {totalPages} ({total} total)
      </span>
      <button className="btn-outline" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </div>
  );
}
