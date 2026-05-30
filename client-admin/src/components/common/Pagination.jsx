export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="admin-btn-secondary disabled:opacity-40"
      >
        ← Prev
      </button>
      <span>Page {page} of {totalPages}</span>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        className="admin-btn-secondary disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}
