import './globals.css';
import type { ReactNode } from 'react';
import { ModuleLayout } from '@/components/ModuleLayout';
import { ClientProviders } from '@/components/ClientProviders';
import { ProviderContextProvider } from '@/contexts/ProviderContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <ProviderContextProvider>
            <ModuleLayout>
              {children}
            </ModuleLayout>
          </ProviderContextProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
