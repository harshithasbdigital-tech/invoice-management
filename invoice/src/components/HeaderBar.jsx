import React from 'react';
import { IconMenu } from './Icons';

export function HeaderBar({
  title = "Quotations",
  onToggleMobileMenu
}) {
  return (
    <header className="px-5 sm:px-8 py-4 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-xs no-print sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 shadow-xs cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <IconMenu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
          {title}
        </h1>
      </div>
    </header>
  );
}
