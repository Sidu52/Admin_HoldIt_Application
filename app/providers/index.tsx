'use client';

import { ReactNode } from 'react';
import ReduxProvider from './ReduxProvider';
import QueryProvider from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <ThemeProvider>
        <QueryProvider>
          {children}
        </QueryProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}