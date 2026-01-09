'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
    router.refresh();
  };

  const getCompactPageItems = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1) as (
        | number
        | 'left-ellipsis'
        | 'right-ellipsis'
      )[];
    }

    const items: (number | 'left-ellipsis' | 'right-ellipsis')[] = [];

    // Prima pagina
    items.push(1);

    // Ellipsis sinistra
    if (currentPage > 3) {
      items.push('left-ellipsis');
    }

    // Pagine centrali
    const centerStart = Math.max(2, currentPage - 1);
    const centerEnd = Math.min(totalPages - 1, currentPage + 1);

    for (let page = centerStart; page <= centerEnd; page++) {
      if (!items.includes(page)) items.push(page);
    }

    // Ellipsis destra
    if (currentPage < totalPages - 2) {
      items.push('right-ellipsis');
    }

    // Ultima pagina
    if (!items.includes(totalPages)) items.push(totalPages);

    return items;
  };

  const pageItems = getCompactPageItems();

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 shadow-theme-xs dark:bg-gray-950">
      {/* Left: Previous */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-theme-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white dark:disabled:text-gray-500"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-xs text-gray-500 dark:text-gray-400">
          <ChevronLeft />
        </span>
        <span className="hidden xsm:inline">Previous</span>
      </button>

      {/* Center: pages (compatta) */}
      <div className="flex items-center gap-1.5">
        {pageItems.map((item, index) => {
          if (item === 'left-ellipsis' || item === 'right-ellipsis') {
            return (
              <span
                key={`${item}-${index}`}
                className="px-1 text-theme-xs font-medium uppercase tracking-wide text-gray-400"
              >
                ...
              </span>
            );
          }

          const page = item as number;
          const isActive = page === currentPage;

          return (
            <button
              key={page}
              onClick={() => goToPage(page)}
              disabled={isActive}
              className={[
                'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-theme-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950',
                isActive
                  ? 'bg-brand-500 text-white shadow-theme-xs cursor-default'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-500 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-brand-400',
              ].join(' ')}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Right: Next + info */}
      <div className="flex items-center gap-3">
        <p className="hidden text-theme-xs text-gray-500 sm:inline">
          Page{' '}
          <span className="font-medium text-gray-900 dark:text-white">
            {currentPage}
          </span>{' '}
          of{' '}
          <span className="font-medium text-gray-900 dark:text-white">
            {totalPages}
          </span>
        </p>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-theme-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white dark:disabled:text-gray-500"
        >
          <span className="hidden xsm:inline">Next</span>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-xs text-gray-500 dark:text-gray-400">
            <ChevronRight />
          </span>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
