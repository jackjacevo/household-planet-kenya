'use client';

import { QueryClient } from '@tanstack/react-query';
import { isFeatureEnabled } from '@/lib/config/admin-config';

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: isFeatureEnabled('advancedCaching') ? 5 * 60 * 1000 : 2 * 60 * 1000,
        gcTime: isFeatureEnabled('advancedCaching') ? 10 * 60 * 1000 : 5 * 60 * 1000,
        retry: (failureCount, error: any) => {
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            return false;
          }
          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
      },
    },
  });
};