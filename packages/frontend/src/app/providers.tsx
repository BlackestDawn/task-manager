'use client';
import type { ReactNode } from "react";
import { ClientAuthProvider } from "@/components/auth/clientAuthProvider";

interface ProviderProps {
  children: ReactNode;
}

export default function Providers({ children }: ProviderProps) {
  return (
    <ClientAuthProvider>
      {children}
    </ClientAuthProvider>
  )
}
