'use client';
import type { ReactNode } from "react";
import { ClientAuthProvider } from "@/components/auth/clientAuthProvider";
import RedirectNotification from "@/components/auth/RedirectNotification";

interface ProviderProps {
  children: ReactNode;
}

export default function Providers({ children }: ProviderProps) {
  return (
    <ClientAuthProvider>
      {children}
      <RedirectNotification />
    </ClientAuthProvider>
  )
}
