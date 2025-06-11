import { useState } from 'react';
import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit, Trash2, Plus, RefreshCw, Search, Calendar, User, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTable from '@/components/tables/data-table';
import BorrowForm from '@/components/forms/borrow-form';
import ReturnBookForm from '@/components/forms/return-book-form';
import BorrowingTrends from '@/components/dashboard/borrowing-trends';
import MostBorrowedBooksChart from '@/components/dashboard/most-borrowed-books-chart';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { localStorage_storage } from '@/lib/localStorage';
import { Input } from "@/components/ui/input";
import { useTranslation } from '@/lib/settings';

const BorrowingManagement = () => {
  const { t } = useTranslation();

  return (
    <div className="animate-fade-in">
      <div className="mb-6 animate-slide-up">
        <h2 className="text-2xl font-bold">{t.borrowingManagement}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t.trackBorrowing}
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search borrowings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                New Borrowing
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>New Borrowing Record</DialogTitle>
                <DialogDescription>
                  Create a new borrowing record. Fill out the form below.
                </DialogDescription>
              </DialogHeader>
              <BorrowForm 
                onSuccess={() => setOpenAddDialog(false)} 
                onCancel={() => setOpenAddDialog(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
              {tab.label}
              <Badge variant="secondary" className="ml-1">{tab.count}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {statusTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <DataTable
              data={filteredBorrowings}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="No borrowing records found"
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Borrowed Books Section */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-white bg-clip-text text-transparent flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Borrowed Books
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Analytics and trends for borrowed books in the library
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="order-1">
              <MostBorrowedBooksChart />
            </div>
            <div className="order-2">
              <BorrowingTrends />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BorrowingManagement;