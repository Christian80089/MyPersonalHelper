'use client';
import { useRouter, useSearchParams } from 'next/navigation';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    console.log('🖱️ CLICK PAGINA:', page);
    const params = new URLSearchParams(searchParams.toString());
    console.log('📝 NUOVI PARAMS:', params.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
    router.refresh(); // ✅ Server re-fetch
  };

  // ← LOGICA CORRETTA: sempre 1-2-3...N o pagine centrali
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    
    // Sempre prima pagina
    range.push(1);
    
    // Pagine centrali
    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }
    
    // Sempre ultima pagina
    if (totalPages > 1) range.push(totalPages);
    
    // Rimuovi duplicati e ordina
    return [...new Set(range)].sort((a, b) => a - b);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center gap-1">
      {/* Previous */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="mr-2 flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] transition-colors"
      >
        Previous
      </button>

      {/* Pagine */}
      <div className="flex items-center gap-1">
        {visiblePages[0] > 1 && <span className="px-2 text-sm text-gray-500">...</span>}
        
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            disabled={page === currentPage} // ← Disabilita pagina corrente
            className={`h-10 w-10 rounded-lg text-sm font-medium flex items-center justify-center transition-all duration-200 ${
              page === currentPage
                ? "bg-brand-500 text-white shadow-md cursor-default ring-2 ring-brand-400/50"
                : "text-gray-700 hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-white/[0.08] dark:hover:text-brand-400"
            } focus:outline-none focus:ring-2 focus:ring-brand-500`}
          >
            {page}
          </button>
        ))}
        
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <span className="px-2 text-sm text-gray-500">...</span>
        )}
      </div>

      {/* Next */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="ml-2 flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] transition-colors"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
