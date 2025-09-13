// This file is used to define the root layout of the application.
import type { Metadata } from 'next';
import { Roboto_Flex, Roboto_Mono, Roboto_Serif } from "next/font/google";
import './globals.css';
import SiteHeader from '@/components/general/siteHeader';
import SiteFooter from '@/components/general/siteFooter';
import { ServerAuthProvider, ClientAuthProvider } from '@/lib/auth';
import { ReactQueryProvider } from '@/lib/providers/reactQueryProvider';

const robotoFlex = Roboto_Flex({
  variable: '--font-roboto-flex',
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
});

const robotoSerif = Roboto_Serif({
  variable: '--font-roboto-serif',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Task Manager',
  description: 'A simple task management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <ServerAuthProvider>
        <ReactQueryProvider>
          <ClientAuthProvider>
        <div className={`${robotoMono.variable} ${robotoSerif.variable} ${robotoFlex.variable} antialiased`}>
          <div className="max-w-[1280px] text-center font-sans">
            <SiteHeader />

                <main>
                {children}
                </main>

            <SiteFooter />
          </div>
        </div>
          </ClientAuthProvider>
        </ReactQueryProvider>
      </ServerAuthProvider>
    </html>
  );
}
