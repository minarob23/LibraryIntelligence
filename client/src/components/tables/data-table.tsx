import { useState } from 'react';
import { useCompactView } from '@/lib/context/compact-view-context';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import TablePagination from './table-pagination';

interface Column {
  key: string;
  header: string;
  cell?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  searchable?: boolean;
  filterComponent?: React.ReactNode;
  actions?: (row: any) => React.ReactNode;
  loading?: boolean;
  pagination?: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
  };
}

const DataTable = ({
  data,
  columns,
  searchable = false,
  filterComponent,
  actions,
  loading = false,
  pagination
}: DataTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { isCompactView } = useCompactView();
  const itemsPerPage = pagination?.itemsPerPage || 10;

  // Filter data by search term
  const filteredData = searchTerm.trim() !== '' 
    ? data.filter(item => 
        Object.values(item).some(
          val => 
            val && 
            val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  return (
    <div className="data-table-container">
      {(searchable || filterComponent) && (
        <div className="px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between border-b dark:border-gray-700 space-y-2 md:space-y-0">
          {searchable && (
            <div className="relative max-w-xs w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {filterComponent && (
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="md:mr-2"
              >
                <Filter size={16} className="mr-1" />
                Filters
              </Button>
              {showFilters && (
                <div className="ml-2">
                  {filterComponent}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <Table className={isCompactView ? 'compact' : ''}>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-700">
              {columns.map((column) => (
                <TableHead key={column.key} className={`text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isCompactView ? 'px-2 py-2' : 'px-4 py-3'}`}>
                  {column.header}
                </TableHead>
              ))}
              {actions && (
                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="py-16 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                  </div>
                  <div className="mt-4 text-gray-500 dark:text-gray-400">Loading data...</div>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="py-16 text-center">
                  <div className="text-gray-500 dark:text-gray-400">No data found</div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column.key}`} className="px-4 py-3 whitespace-nowrap text-sm">
                      {column.cell ? column.cell(row) : row[column.key]}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <TablePagination
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          currentPage={pagination.currentPage}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
};

export default DataTable;