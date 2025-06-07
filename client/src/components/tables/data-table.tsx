
import React from 'react';
import { ChevronDown, MoreHorizontal, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface DataTableProps {
  data: any[];
  columns: Array<{
    key?: string;
    id?: string;
    header: string;
    cell: (row: any, index?: number) => React.ReactNode;
  }>;
  isLoading?: boolean;
  emptyMessage?: string;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: any) => void;
    show?: (row: any) => boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    requireConfirm?: boolean;
    confirmTitle?: string;
    confirmDescription?: string;
  }>;
  pagination?: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
  };
}

const DataTable: React.FC<DataTableProps> = ({
  data = [],
  columns = [],
  isLoading = false,
  emptyMessage = 'No data available',
  actions = [],
  pagination,
}) => {
  // Safe data array with fallback
  const safeData = Array.isArray(data) ? data : [];
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeActions = Array.isArray(actions) ? actions : [];

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {safeColumns.map((column, columnIndex) => (
                <TableHead key={`header-${column.key || column.id || columnIndex}`}>
                  {column.header}
                </TableHead>
              ))}
              {safeActions.length > 0 && (
                <TableHead key="actions-header">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={`skeleton-row-${rowIndex}`}>
                {safeColumns.map((_, columnIndex) => (
                  <TableCell key={`skeleton-cell-${rowIndex}-${columnIndex}`}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
                {safeActions.length > 0 && (
                  <TableCell key={`skeleton-actions-${rowIndex}`}>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (safeData.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {safeColumns.map((column, columnIndex) => (
                <TableHead key={`empty-header-${column.key || column.id || columnIndex}`}>
                  {column.header}
                </TableHead>
              ))}
              {safeActions.length > 0 && (
                <TableHead key="empty-actions-header">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell 
                colSpan={safeColumns.length + (safeActions.length > 0 ? 1 : 0)} 
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {safeColumns.map((column, columnIndex) => (
              <TableHead key={`header-${column.key || column.id || columnIndex}`}>
                {column.header}
              </TableHead>
            ))}
            {safeActions.length > 0 && (
              <TableHead key="actions-header">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeData.map((row, rowIndex) => {
            // Create a unique key for each row
            const rowKey = row.id ? `row-${row.id}` : `row-${rowIndex}-${Date.now()}`;
            
            return (
              <TableRow key={rowKey}>
                {safeColumns.map((column, columnIndex) => {
                  const cellKey = `cell-${rowKey}-${column.key || column.id || columnIndex}`;
                  
                  return (
                    <TableCell key={cellKey}>
                      {typeof column.cell === 'function' 
                        ? column.cell(row, rowIndex) 
                        : row[column.key || column.id || '']
                      }
                    </TableCell>
                  );
                })}
                
                {safeActions.length > 0 && (
                  <TableCell key={`actions-${rowKey}`}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {safeActions.map((action, actionIndex) => {
                          // Check if action should be shown for this row
                          if (action.show && !action.show(row)) {
                            return null;
                          }

                          const actionKey = `action-${rowKey}-${actionIndex}`;

                          if (action.requireConfirm) {
                            return (
                              <AlertDialog key={actionKey}>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    {action.icon}
                                    <span className="ml-2">{action.label}</span>
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {action.confirmTitle || 'Are you sure?'}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {action.confirmDescription || 'This action cannot be undone.'}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => action.onClick(row)}
                                      className={action.variant === 'destructive' ? 'bg-red-500 hover:bg-red-600' : ''}
                                    >
                                      {action.label}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            );
                          }

                          return (
                            <DropdownMenuItem
                              key={actionKey}
                              onClick={() => action.onClick(row)}
                              className={action.variant === 'destructive' ? 'text-red-600 dark:text-red-400' : ''}
                            >
                              {action.icon}
                              <span className="ml-2">{action.label}</span>
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
