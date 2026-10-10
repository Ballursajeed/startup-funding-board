import React from 'react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  function getPages() {
    const pages = [];
    const WINDOW = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - WINDOW && i <= page + WINDOW)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  }

  const pages = getPages();

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        &laquo; Prev
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="pagination-ellipsis">&hellip;</span>
        ) : (
          <button
            key={p}
            className={`pagination-btn${p === page ? ' pagination-btn--active' : ''}`}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        className="pagination-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        Next &raquo;
      </button>
    </nav>
  );
}
