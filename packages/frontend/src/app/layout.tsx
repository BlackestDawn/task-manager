// This file is used to define the root layout of the application.
import type { Metadata } from 'next';
import { Roboto_Flex, Roboto_Mono, Roboto_Serif } from "next/font/google";
import './globals.css';
import SiteHeader from '@/components/general/siteHeader';
import SiteFooter from '@/components/general/siteFooter';
import { ServerAuthProvider } from '@/components/auth/serverAuthProvider';
import Providers from './providers';
import { checkAuthAction } from '@/lib/actions/auth';

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated } = await checkAuthAction();

  return (
    <html lang="en">
      <body className={`${robotoMono.variable} ${robotoSerif.variable} ${robotoFlex.variable} antialiased`}>
        <ServerAuthProvider initialUser={user} initialIsAuthenticated={isAuthenticated}>
          <Providers>
            <div className="font-sans min-h-screen flex flex-col">
              <header className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <SiteHeader />
              </header>
              <main className="flex-1 bg-background">
                {children}
              </main>
              <footer className="bg-gray-50 dark-bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <SiteFooter />
              </footer>
            </div>
          </Providers>
        </ServerAuthProvider>
      </body>
    </html>
  )
}
