import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface TablePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

const TablePagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  siblingCount = 1
}: TablePaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;
  
  // Calculate start and end item numbers
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers for display
  const generatePageNumbers = () => {
    // Always show first page, last page, current page, and a certain number of siblings
    const pageNumbers = [];
    
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    
    // Whether to show dots
    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;
    
    // Always add first page
    pageNumbers.push(1);
    
    // Add left dots if needed
    if (showLeftDots) {
      pageNumbers.push('left-dots');
    }
    
    // Add pages around current page
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) {
        pageNumbers.push(i);
      }
    }
    
    // Add right dots if needed
    if (showRightDots) {
      pageNumbers.push('right-dots');
    }
    
    // Always add last page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const pageNumbers = generatePageNumbers();
  
  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t dark:border-gray-700">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-400">
            Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <Button
              variant="outline"
              size="icon"
              className="rounded-l-md"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">First page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            
            {pageNumbers.map((page, index) => {
              if (page === 'left-dots' || page === 'right-dots') {
                return (
                  <Button
                    key={`dots-${index}`}
                    variant="outline"
                    size="icon"
                    disabled
                  >
                    ...
                  </Button>
                );
              }
              
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => onPageChange(page as number)}
                >
                  {page}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-r-md"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Last page</span>
            </Button>
          </nav>
        </div>
      </div>
      
      {/* Mobile pagination */}
      <div className="flex items-center justify-between sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <span className="text-sm text-gray-700 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default TablePagination;
