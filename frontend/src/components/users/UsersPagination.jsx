import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PAGE_SIZE } from './UsersConstants';

const UsersPagination = ({ total, page, onPageChange }) => {
  if (total <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-2">
      <p className="text-[13px] font-medium text-slate-500">
        Hiển thị <span className="text-slate-900 font-bold">{Math.min((page - 1) * PAGE_SIZE + 1, total)}</span>
        –<span className="text-slate-900 font-bold">{Math.min(page * PAGE_SIZE, total)}</span>
        {' '}trong <span className="text-slate-900 font-bold">{total}</span> kết quả
      </p>
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1 shadow-sm">
          <button onClick={() => onPageChange(1)} disabled={page === 1} className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"><ChevronsLeft size={16} /></button>
          <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"><ChevronLeft size={16} /></button>
          <div className="h-4 w-px bg-slate-200 mx-1"></div>
          <div className="flex items-center px-2">
            {(() => {
              // Show at most 5 page buttons with ellipsis
              const pages = [];
              const maxVisible = 5;
              let start = Math.max(1, page - Math.floor(maxVisible / 2));
              let end = Math.min(totalPages, start + maxVisible - 1);
              if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

              if (start > 1) {
                pages.push(<button key={1} onClick={() => onPageChange(1)} className="w-8 h-8 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">1</button>);
                if (start > 2) pages.push(<span key="s-ell" className="w-6 text-center text-slate-300 text-xs">…</span>);
              }
              for (let p = start; p <= end; p++) {
                pages.push(
                  <button key={p} onClick={() => onPageChange(p)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${p === page ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-600 hover:bg-slate-50'}`}>{p}</button>
                );
              }
              if (end < totalPages) {
                if (end < totalPages - 1) pages.push(<span key="e-ell" className="w-6 text-center text-slate-300 text-xs">…</span>);
                pages.push(<button key={totalPages} onClick={() => onPageChange(totalPages)} className="w-8 h-8 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">{totalPages}</button>);
              }
              return pages;
            })()}
          </div>
          <div className="h-4 w-px bg-slate-200 mx-1"></div>
          <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"><ChevronRight size={16} /></button>
          <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages} className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"><ChevronsRight size={16} /></button>
        </div>
      </div>
    </div>
  );
};

export default UsersPagination;
