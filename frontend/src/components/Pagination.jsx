const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.pages <= 1) return null;

  return (
<<<<<<< HEAD
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
      <span className="text-slate-500">
=======
    <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.015] px-4 py-3 text-sm">
      <span className="text-white/42">
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b
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
