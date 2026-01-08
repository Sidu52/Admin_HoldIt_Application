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
    <nav className="flex items-center justify-between px-4 py-4">
      {/* Previous */}
      <div className="flex w-0 flex-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex cursor-pointer hover:text-[#0056b8] items-center pr-1 pt-4 text-sm font-medium text-gray-500"
        >
          <GoArrowLeft className="mr-1 size-5" />
          Previous
        </button>
      </div>

      {/* Pages */}
      <div className="hidden md:flex">
        {paginationRange.map((page, index) => (
          <button
            key={index}
            disabled={page === "..."}
            onClick={() => typeof page === "number" && onPageChange(page)}
            className={`inline-flex items-center px-3 pt-4 text-sm font-medium ${
              page === currentPage
                ? "text-[#0056b8]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next */}
      <div className="flex w-0 flex-1 justify-end">
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex cursor-pointer hover:text-[#0056b8] items-center pl-1 pt-4 text-sm font-medium text-gray-500"
        >
          Next
          <GoArrowRight className="ml-1 size-5" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
