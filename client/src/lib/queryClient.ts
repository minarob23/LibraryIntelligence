import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { localStorage_storage } from './localStorage';

// Mock API responses using localStorage
const mockApiResponse = async (endpoint: string, options?: any): Promise<any> => {
  try {
    const [path, queryString] = endpoint.split('?');
    const params = new URLSearchParams(queryString || '');

    switch (true) {
    case path === '/api/books':
      if (options?.method === 'POST') {
        return localStorage_storage.createBook(options.body);
      }
      return localStorage_storage.getBooks();

    case path.startsWith('/api/books/'):
      const bookId = parseInt(path.split('/')[3]);

      if (options?.method === 'PUT') {
        return localStorage_storage.updateBook(bookId, options.body);
      } else if (options?.method === 'DELETE') {
        return localStorage_storage.deleteBook(bookId);
      }

      return localStorage_storage.getBook(bookId);

    case path === '/api/borrowers':
      const category = params.get('category');
      if (options?.method === 'POST') {
        const data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        return localStorage_storage.createBorrower(data);
      }
      return category ? localStorage_storage.getBorrowersByCategory(category) : localStorage_storage.getBorrowers();

    case path.startsWith('/api/borrowers/'):
      const borrowerId = parseInt(path.split('/')[3]);

      if (options?.method === 'PUT') {
        const data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        return localStorage_storage.updateBorrower(borrowerId, data);
      }

      if (options?.method === 'DELETE') {
        return localStorage_storage.deleteBorrower(borrowerId);
      }

      return localStorage_storage.getBorrower(borrowerId);

    case path === '/api/librarians':
      if (options?.method === 'POST') {
        const data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        return localStorage_storage.createLibrarian(data);
      }
      return localStorage_storage.getLibrarians();

    case path.startsWith('/api/librarians/'):
      const librarianId = parseInt(path.split('/')[3]);

      if (options?.method === 'PUT') {
        const data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        return localStorage_storage.updateLibrarian(librarianId, data);
      }

      if (options?.method === 'DELETE') {
        return localStorage_storage.deleteLibrarian(librarianId);
      }

      return localStorage_storage.getLibrarian(librarianId);



    case path === '/api/borrowings':
      const borrowerIdParam = params.get('borrowerId');
      if (options?.method === 'POST') {
        const data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        return localStorage_storage.createBorrowing(data);
      } else if (options?.method === 'PUT') {
        const id = parseInt(path.split('/').pop() || '0');
        const data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        return localStorage_storage.updateBorrowing(id, data);
      } else if (options?.method === 'DELETE') {
        const id = parseInt(path.split('/').pop() || '0');
        return localStorage_storage.deleteBorrowing(id);
      }
      return borrowerIdParam ? localStorage_storage.getBorrowingsByBorrowerId(parseInt(borrowerIdParam)) : localStorage_storage.getBorrowings();

    case path.startsWith('/api/borrowings/'):
      const pathParts = path.split('/');
      const borrowingId = parseInt(pathParts[3]);

      if (options?.method === 'PUT') {
        const data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        return localStorage_storage.updateBorrowing(borrowingId, data);
      }

      if (options?.method === 'DELETE') {
        return localStorage_storage.deleteBorrowing(borrowingId);
      }

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



    case path === '/api/dashboard/member-growth':
      // Return borrowers data for member growth calculation
      return localStorage_storage.getBorrowers();

    case path === '/api/feedback':
      if (options?.method === 'POST') {
        const data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        return localStorage_storage.createFeedback(data);
      }
      return localStorage_storage.getFeedback();

    case path.startsWith('/api/feedback/'):
      const feedbackId = parseInt(path.split('/')[3]);

      if (options?.method === 'PUT') {
        const data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        return localStorage_storage.updateFeedback(feedbackId, data);
      }

      if (options?.method === 'DELETE') {
        return localStorage_storage.deleteFeedback(feedbackId);
      }

      return localStorage_storage.getFeedback().find((f: any) => f.id === feedbackId);

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
      console.warn(`Unknown endpoint: ${options?.method || 'GET'} ${path}, returning empty response`);
      return { success: true, data: null };
  }
  } catch (error) {
    console.error('Mock API error for endpoint:', endpoint, error);
    // Return a default error response instead of throwing
    return { 
      error: true, 
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      endpoint 
    };
  }
};

export const apiRequest = async (method: string, endpoint: string, data?: any) => {
  try {
    const options: any = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = data;
    }

    const response = await mockApiResponse(endpoint, options);

    // Since mockApiResponse returns data directly, not a response object, just return it
    return response;
  } catch (error) {
    console.error('API Request Error:', error);

    // Fallback to localStorage for borrowings endpoints
    if (endpoint.includes('/api/borrowings')) {
      const { localStorage_storage } = await import('./localStorage');

      if (method === 'POST') {
        return localStorage_storage.createBorrowing(data);
      } else if (method === 'PUT') {
        const id = parseInt(endpoint.split('/').pop() || '0');
        return localStorage_storage.updateBorrowing(id, data);
      } else if (method === 'DELETE') {
        const id = parseInt(endpoint.split('/').pop() || '0');
        return localStorage_storage.deleteBorrowing(id);
      } else {
        return localStorage_storage.getBorrowings();
      }
    }

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
      if (response && response.error) {
        console.warn('Query error for', queryKey[0], ':', response.message);
        return null;
      }
      return response;
    } catch (error: any) {
      console.error('Query function error for', queryKey[0], ':', error);
      if (unauthorizedBehavior === "returnNull" && error.status === 401) {
        return null;
      }
      return null;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 10 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      retry: false,
      throwOnError: false,
    },
    mutations: {
      retry: false,
      throwOnError: false,
    },
  },
});