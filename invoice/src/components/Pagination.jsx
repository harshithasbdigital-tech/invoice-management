import React from 'react';

export function Pagination({ currentPage, totalPages, onPageChange, className = '' }) {
  if (!totalPages || totalPages <= 1) return null;

  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    let start = Math.max(2, validCurrentPage - 1);
    let end = Math.min(totalPages - 1, validCurrentPage + 1);

    if (validCurrentPage <= 3) {
      start = 2;
      end = 4;
    } else if (validCurrentPage >= totalPages - 2) {
      start = totalPages - 3;
      end = totalPages - 1;
    }

    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`flex items-center justify-center sm:justify-end gap-1.5 px-4 py-3 bg-slate-50/80 border-t border-slate-200 text-xs ${className}`}>
      <button
        type="button"
        disabled={validCurrentPage === 1}
        onClick={() => onPageChange(Math.max(1, validCurrentPage - 1))}
        className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition cursor-pointer ${
          validCurrentPage === 1
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-blue-600'
        }`}
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((pageNum, idx) => {
          if (pageNum === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="w-6 text-center text-slate-400 font-bold text-xs select-none">
                …
              </span>
            );
          }
          const isSelected = validCurrentPage === pageNum;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`w-7 h-7 rounded-lg font-bold text-xs transition cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-blue-600'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={validCurrentPage === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, validCurrentPage + 1))}
        className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition cursor-pointer ${
          validCurrentPage === totalPages
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-blue-600'
        }`}
      >
        Next
      </button>
    </div>
  );
}
