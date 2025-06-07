import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { localStorage_storage } from './localStorage';

// Mock API responses for development
const mockApiResponse = async (url: string, options: RequestInit = {}) => {
  const method = options.method || 'GET';

  // Extract endpoint from URL
  const endpoint = url.replace('/api', '');

  try {
    if (method === 'GET') {
      if (endpoint === '/books') {
        return localStorage_storage.getBooks();
      } else if (endpoint === '/borrowers') {
        return localStorage_storage.getBorrowers();
      } else if (endpoint === '/librarians') {
        return localStorage_storage.getLibrarians();
      } else if (endpoint === '/borrowings') {
        return localStorage_storage.getBorrowings();
      } else if (endpoint === '/membershipApplications') {
        return localStorage_storage.getMembershipApplications();
      }
    } else if (method === 'POST') {
      let body;
      try {
        body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
      } catch (error) {
        console.error('Error parsing request body:', error);
        throw new Error('Invalid request body');
      }

      if (endpoint === '/books') {
        return localStorage_storage.addBook(body);
      } else if (endpoint === '/borrowers') {
        return localStorage_storage.addBorrower(body);
      } else if (endpoint === '/librarians') {
        return localStorage_storage.addLibrarian(body);
      } else if (endpoint === '/borrowings') {
        return localStorage_storage.addBorrowing(body);
      } else if (endpoint === '/membershipApplications') {
        return localStorage_storage.addMembershipApplication(body);
      }
    } else if (method === 'PUT') {
      let body;
      try {
        body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
      } catch (error) {
        console.error('Error parsing request body:', error);
        throw new Error('Invalid request body');
      }

      const idMatch = endpoint.match(/\/(\w+)\/(\d+)/);

      if (idMatch) {
        const [, resource, id] = idMatch;
        const numericId = parseInt(id);

        if (resource === 'books') {
          return localStorage_storage.updateBook(numericId, body);
        } else if (resource === 'borrowers') {
          return localStorage_storage.updateBorrower(numericId, body);
        } else if (resource === 'librarians') {
          return localStorage_storage.updateLibrarian(numericId, body);
        } else if (resource === 'borrowings') {
          return localStorage_storage.updateBorrowing(numericId, body);
        }
      }
    } else if (method === 'DELETE') {
      const idMatch = endpoint.match(/\/(\w+)\/(\d+)/);

      if (idMatch) {
        const [, resource, id] = idMatch;
        const numericId = parseInt(id);

        if (resource === 'books') {
          return localStorage_storage.deleteBook(numericId);
        } else if (resource === 'borrowers') {
          return localStorage_storage.deleteBorrower(numericId);
        } else if (resource === 'librarians') {
          return localStorage_storage.deleteLibrarian(numericId);
        } else if (resource === 'borrowings') {
          return localStorage_storage.deleteBorrowing(numericId);
        }
      }
    }

    throw new Error(`Endpoint ${endpoint} not found`);
  } catch (error) {
    console.error('Mock API Error:', error);
    throw error;
  }
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await mockApiResponse(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Since mockApiResponse returns data directly, not a response object, just return it
    return response;
  } catch (error) {
    console.error('API Request Error:', error);

    // Fallback to localStorage for borrowings endpoints
    if (endpoint.includes('/api/borrowings')) {
      const { localStorage_storage } = await import('./localStorage');

      if (options.method === 'POST') {
        const body = JSON.parse(options.body as string);
        return localStorage_storage.createBorrowing(body);
      } else if (options.method === 'PUT') {
        const id = parseInt(endpoint.split('/').pop() || '0');
        const body = JSON.parse(options.body as string);
        return localStorage_storage.updateBorrowing(id, body);
      } else if (options.method === 'DELETE') {
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