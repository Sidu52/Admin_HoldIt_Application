import { useMemo } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}) => {
  const paginationRange = useMemo(() => {
    if (totalPages <= 1) return [];

    const totalNumbers = siblingCount * 2 + 5;
    if (totalNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 1;

    const pages: (number | string)[] = [];

    pages.push(1);

    if (showLeftDots) pages.push("...");

    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) pages.push(i);
    }

    if (showRightDots) pages.push("...");

    if (totalPages !== 1) pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages, siblingCount]);

  if (totalPages <= 1) return null;

  return (
    <div className="bg-slate-50 dark:bg-[#192233] px-6 py-4 border-t border-slate-200 dark:border-[#324467] flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center size-8 rounded hover:bg-slate-200 dark:hover:bg-[#324467] text-slate-500 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-lg">
            chevron_left
          </span>
        </button>

        {/* Pages */}
        {paginationRange.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`flex items-center justify-center size-8 rounded text-sm font-medium transition-colors ${
              currentPage === page
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "hover:bg-slate-200 dark:hover:bg-[#324467] text-slate-700 dark:text-slate-300"
            } disabled:cursor-default`}
          >
            {page}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center size-8 rounded hover:bg-slate-200 dark:hover:bg-[#324467] text-slate-500 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-lg">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
