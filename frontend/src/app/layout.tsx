import './globals.css';
import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { ModuleLayout } from '@/components/ModuleLayout';
import { ClientProviders } from '@/components/ClientProviders';
import { ProviderContextProvider } from '@/contexts/ProviderContext';
import { UserContextProvider } from '@/contexts/UserContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <UserContextProvider>
            <ProviderContextProvider>
              <ModuleLayout>
                {children}
                <Toaster position="top-right" />
              </ModuleLayout>
            </ProviderContextProvider>
          </UserContextProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
