'use client';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { ClientAuthProvider } from "@/components/auth/clientAuthProvider";
import RedirectNotification from "@/components/auth/RedirectNotification";

interface ProviderProps {
  children: ReactNode;
}

export default function Providers({ children }: ProviderProps) {
  const [queryClient] = useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          retry: (failureCount, error: any) => {
            if (error?.response?.status === 401 || error?.response?.status === 403) return false;
            return failureCount <3;
          },
        },
        mutations: {
          retry: false,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ClientAuthProvider>
        {children}
        <RedirectNotification />
      </ClientAuthProvider>
    </QueryClientProvider>
  )
}
