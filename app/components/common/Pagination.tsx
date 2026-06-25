import React, { useMemo } from "react";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";

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
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    if (showRightDots) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages, siblingCount]);

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-between px-4 py-4 w-full border-t border-border-light dark:border-border-dark">
      {/* Previous */}
      <div className="flex w-0 flex-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex cursor-pointer hover:text-primary dark:hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed items-center pr-1 pt-4 text-sm font-semibold text-text-muted-light dark:text-text-muted-dark transition-colors"
        >
          <GoArrowLeft className="mr-2 size-5" />
          Previous
        </button>
      </div>

      {/* Pages */}
      <div className="hidden md:flex">
        {paginationRange.map((p, index) => (
          <button
            key={index}
            disabled={p === "..."}
            onClick={() => typeof p === "number" && onPageChange(p)}
            className={`inline-flex items-center px-4 pt-4 text-sm font-semibold border-t-2 transition-all cursor-pointer ${
              p === currentPage
                ? "border-primary text-primary"
                : "border-transparent text-text-muted-light dark:text-text-muted-dark hover:text-text-main-light dark:hover:text-text-main-dark hover:border-border-light dark:hover:border-border-dark"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Next */}
      <div className="flex w-0 flex-1 justify-end">
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex cursor-pointer hover:text-primary dark:hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed items-center pl-1 pt-4 text-sm font-semibold text-text-muted-light dark:text-text-muted-dark transition-colors"
        >
          Next
          <GoArrowRight className="ml-2 size-5" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
