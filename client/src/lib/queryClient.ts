import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { localStorage_storage } from './localStorage';

// Mock API responses using localStorage
const mockApiResponse = async (endpoint: string, options?: any): Promise<any> => {
  const [path, queryString] = endpoint.split('?');
  const params = new URLSearchParams(queryString || '');

  switch (true) {
    case path === '/api/books':
      if (options?.method === 'POST') {
        return localStorage_storage.createBook(options.body);
      } else if (options?.method === 'PUT') {
        const id = parseInt(path.split('/').pop() || '0');
        return localStorage_storage.updateBook(id, options.body);
      } else if (options?.method === 'DELETE') {
        const id = parseInt(path.split('/').pop() || '0');
        return localStorage_storage.deleteBook(id);
      }
      return localStorage_storage.getBooks();

    case path.startsWith('/api/books/'):
      const bookId = parseInt(path.split('/')[3]);
      return localStorage_storage.getBook(bookId);

    case path === '/api/borrowers':
      const category = params.get('category');
      if (options?.method === 'POST') {
        return localStorage_storage.createBorrower(options.body);
      } else if (options?.method === 'PUT') {
        const id = parseInt(path.split('/').pop() || '0');
        return localStorage_storage.updateBorrower(id, options.body);
      } else if (options?.method === 'DELETE') {
        const id = parseInt(path.split('/').pop() || '0');
        return localStorage_storage.deleteBorrower(id);
      }
      return category ? localStorage_storage.getBorrowersByCategory(category) : localStorage_storage.getBorrowers();

    case path.startsWith('/api/borrowers/'):
      const borrowerId = parseInt(path.split('/')[3]);
      return localStorage_storage.getBorrower(borrowerId);

    case path === '/api/librarians':
      if (options?.method === 'POST') {
        return localStorage_storage.createLibrarian(options.body);
      } else if (options?.method === 'PUT') {
        const id = parseInt(path.split('/').pop() || '0');
        return localStorage_storage.updateLibrarian(id, options.body);
      } else if (options?.method === 'DELETE') {
        const id = parseInt(path.split('/').pop() || '0');
        return localStorage_storage.deleteLibrarian(id);
      }
      return localStorage_storage.getLibrarians();

    case path.startsWith('/api/librarians/'):
      const librarianId = parseInt(path.split('/')[3]);
      return localStorage_storage.getLibrarian(librarianId);

    case path === '/api/borrowings':
      const borrowerIdParam = params.get('borrowerId');
      if (options?.method === 'POST') {
        return localStorage_storage.createBorrowing(options.body);
      } else if (options?.method === 'PUT') {
        const id = parseInt(path.split('/').pop() || '0');
        return localStorage_storage.updateBorrowing(id, options.body);
      } else if (options?.method === 'DELETE') {
        const id = parseInt(path.split('/').pop() || '0');
        return localStorage_storage.deleteBorrowing(id);
      }
      return borrowerIdParam ? localStorage_storage.getBorrowingsByBorrowerId(parseInt(borrowerIdParam)) : localStorage_storage.getBorrowings();

    case path.startsWith('/api/borrowings/'):
      const pathParts = path.split('/');
      const borrowingId = parseInt(pathParts[3]);
      
      if (pathParts[4] === 'return' && options?.method === 'PUT') {
        const data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        return localStorage_storage.updateBorrowing(borrowingId, data);
      }
      
      if (options?.method === 'PUT') {
        const data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        return localStorage_storage.updateBorrowing(borrowingId, data);
      }
      
      if (options?.method === 'DELETE') {
        return localStorage_storage.deleteBorrowing(borrowingId);
      }
      
      return localStorage_storage.getBorrowing(borrowingId);

    case path === '/api/dashboard/most-borrowed-books':
      const limit1 = parseInt(params.get('limit') || '5');
      return localStorage_storage.getMostBorrowedBooks(limit1);

    case path === '/api/dashboard/popular-books':
      const limit2 = parseInt(params.get('limit') || '4');
      return localStorage_storage.getPopularBooks(limit2);

    case path === '/api/dashboard/top-borrowers':
      const limit3 = parseInt(params.get('limit') || '5');
      return localStorage_storage.getTopBorrowers(limit3);

    case path === '/api/dashboard/borrower-distribution':
      return localStorage_storage.getBorrowerDistribution();

    case path === '/api/membership-application':
      if (options?.method === 'POST') {
        return localStorage_storage.createMembershipApplication(options.body);
      }
      break;

    case path === '/api/reset-ui':
      return { message: 'UI has been reset successfully' };

    case path === '/api/restore-database':
      return { message: 'Database restored successfully' };

    default:
      throw new Error(`Unknown endpoint: ${endpoint}`);
  }
};

export const apiRequest = async (url: string, options?: any) => {
  try {
    const response = await mockApiResponse(url, options);
    return response;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const response = await mockApiResponse(queryKey[0] as string);
      return response;
    } catch (error: any) {
      if (unauthorizedBehavior === "returnNull" && error.status === 401) {
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});