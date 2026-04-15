import { ChevronLeft, ChevronRight } from "lucide-react";

const buildPagination = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }

  if (page >= totalPages - 2) {
    return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", page - 1, page, page + 1, "...", totalPages];
};

export default function ListingsPagination({ currentPage, totalPages, onPageChange, isLoading = false }) {
  if (totalPages <= 1) {
    return null;
  }

  const paginationItems = buildPagination(currentPage, totalPages);

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3" aria-label="Listings pagination">
      <button
        type="button"
        aria-label="Previous page"
        disabled={isLoading || currentPage === 1}
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#e05c4b] hover:text-[#e05c4b] disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:w-12"
      >
        <ChevronLeft size={20} className="sm:h-[22px] sm:w-[22px]" />
      </button>

      {paginationItems.map((item, index) => {
        if (item === "...") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-500 bg-white text-base text-slate-500 sm:h-12 sm:w-12 sm:text-xl"
            >
              ...
            </span>
          );
        }

        const page = Number(item);
        const isActive = page === currentPage;

        return (
          <button
            key={page}
            type="button"
            aria-current={isActive ? "page" : undefined}
            disabled={isLoading}
            onClick={() => onPageChange(page)}
            className={`h-10 w-10 rounded-full border text-sm font-medium transition-all duration-300 ease-out sm:h-12 sm:w-12 sm:text-lg ${
              isActive
                ? "scale-105 border-[#e86666] bg-[#e86666] text-white shadow-md"
                : "border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-[#e05c4b] hover:text-[#e05c4b]"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        aria-label="Next page"
        disabled={isLoading || currentPage === totalPages}
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#e05c4b] hover:text-[#e05c4b] disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:w-12"
      >
        <ChevronRight size={20} className="sm:h-[22px] sm:w-[22px]" />
      </button>
    </nav>
  );
}
