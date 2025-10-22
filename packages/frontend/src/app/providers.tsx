'use client';
import type { ReactNode } from "react";
import { ClientAuthProvider } from "@/components/auth/clientAuthProvider";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

interface ProviderProps {
  children: ReactNode;
}

export default function Providers({ children }: ProviderProps) {
  useTokenRefresh();

  return (
    <ClientAuthProvider>
      {children}
    </ClientAuthProvider>
  )
}
