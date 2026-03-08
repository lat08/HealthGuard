import { ChevronLeft, ChevronRight } from 'lucide-react';

const DevicesPagination = ({ page, limit, total, onPageChange }) => {
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mt-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 font-medium">
          Hiển thị <span className="font-bold text-slate-700">{(page - 1) * limit + 1}</span> -{' '}
          <span className="font-bold text-slate-700">{Math.min(page * limit, total)}</span> trong tổng số{' '}
          <span className="font-bold text-slate-700">{total}</span> thiết bị
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 transition-all active:scale-95"
            title="Trang trước"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((pageNum, idx) =>
              pageNum === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-3 py-2 text-slate-400 text-sm font-medium">
                  ...
                </span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[40px] px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    page === pageNum
                      ? 'bg-indigo-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                  }`}
                >
                  {pageNum}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 transition-all active:scale-95"
            title="Trang sau"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevicesPagination;
