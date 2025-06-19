import { QueryClient } from '@tanstack/react-query';

const apiRequest = async (method: string, url: string, data?: any) => {
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${url}`, config);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      queryFn: async ({ queryKey }) => {
        const [url] = queryKey as [string];
        return apiRequest('GET', url);
      },
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'message' in error) {
          const message = error.message as string;
          if (message.includes('4')) return false;
        }
        return failureCount < 3;
      },
    },
  },
});