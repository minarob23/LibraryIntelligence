import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
import DataTable from '@/components/tables/data-table';
import ResearchForm from '@/components/forms/research-form';
import { apiRequest, queryClient } from '@/lib/queryClient';

const ResearchPage = () => {
  const { toast } = useToast();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingResearch, setEditingResearch] = useState<any>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  
  const { data: researchPapers, isLoading } = useQuery({ 
    queryKey: ['/api/research'],
  });

  const { data: borrowings } = useQuery({ 
    queryKey: ['/api/borrowings'],
  });

  const handleDelete = async (id: number) => {
    try {
      await apiRequest(`/api/research/${id}`, {
        method: 'DELETE',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/research'] });
      toast({
        title: 'Success',
        description: 'Research paper deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting research paper:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete research paper. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const columns = [
    {
      key: 'coverImage',
      header: 'Research',
      cell: (row: any) => (
        <div className="flex items-center">
          <img 
            className="h-12 w-9 object-cover mr-3 rounded" 
            src={row.coverImage} 
            alt={`Cover of ${row.name}`} 
          />
          <div>
            <div className="text-sm font-medium">{row.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'author',
      header: 'Author',
      cell: (row: any) => row.author,
    },
    {
      key: 'publisher',
      header: 'Publisher',
      cell: (row: any) => row.publisher,
    },
    {
      key: 'researchCode',
      header: 'Code',
      cell: (row: any) => row.researchCode,
    },
    {
      key: 'copies',
      header: 'Copies',
      cell: (row: any) => row.copies,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: any) => {
        const isBorrowed = borrowings?.some((b: any) => b.researchId === row.id && b.status === 'borrowed');
        
        if (isBorrowed) {
          return (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              Borrowed
            </Badge>
          );
        } else {
          return (
            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Available
            </Badge>
          );
        }
      },
    },
  ];

  const filterComponent = (
    <div className="flex flex-col md:flex-row gap-2">
      <Select>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Publisher" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Publishers</SelectItem>
          <SelectItem value="penguin">Penguin Random House</SelectItem>
          <SelectItem value="harpercollins">HarperCollins</SelectItem>
          <SelectItem value="macmillan">Macmillan Publishers</SelectItem>
          <SelectItem value="simon">Simon & Schuster</SelectItem>
        </SelectContent>
      </Select>
      
      <Select>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Availability" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="borrowed">Borrowed</SelectItem>
          <SelectItem value="maintenance">In Maintenance</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-center animate-slide-up">
        <div>
          <h2 className="text-2xl font-bold">Research Papers Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Browse and manage the library's research paper collection</p>
        </div>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Research
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Add New Research Paper</DialogTitle>
              <DialogDescription>
                Add a new research paper to the library collection. Fill out the form below with the research details.
              </DialogDescription>
            </DialogHeader>
            <ResearchForm onSuccess={() => setOpenAddDialog(false)} onCancel={() => setOpenAddDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <DataTable
        data={researchPapers || []}
        columns={columns}
        searchable={true}
        filterComponent={filterComponent}
        loading={isLoading}
        actions={(row) => (
          <>
            <Dialog open={openEditDialog && editingResearch?.id === row.id} onOpenChange={(open) => {
              setOpenEditDialog(open);
              if (!open) setEditingResearch(null);
            }}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="text-primary-500 hover:text-primary-600" onClick={() => {
                  setEditingResearch(row);
                  setOpenEditDialog(true);
                }}>
                  <Edit size={16} className="mr-1" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Edit Research Paper</DialogTitle>
                  <DialogDescription>
                    Update the research paper details. Fill out the form below with the updated information.
                  </DialogDescription>
                </DialogHeader>
                {editingResearch && (
                  <ResearchForm 
                    research={editingResearch} 
                    onSuccess={() => setOpenEditDialog(false)} 
                    onCancel={() => setOpenEditDialog(false)} 
                  />
                )}
              </DialogContent>
            </Dialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-red-500 hover:text-red-600 ml-3">
                  <Trash2 size={16} className="mr-1" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the research paper
                    "{row.name}" from the library collection.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(row.id)} className="bg-red-500 hover:bg-red-600">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
        pagination={{
          totalItems: researchPapers?.length || 0,
          itemsPerPage: 10,
          currentPage: 1,
          onPageChange: () => {},
        }}
      />
    </div>
  );
};

export default ResearchPage;
