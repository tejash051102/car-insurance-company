const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.pages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
      <span className="text-slate-500">
        Page {meta.page} of {meta.pages} · {meta.total} records
      </span>
      <div className="flex gap-2">
        <button
          className="btn-secondary"
          type="button"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Previous
        </button>
        <button
          className="btn-secondary"
          type="button"
          disabled={meta.page >= meta.pages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
