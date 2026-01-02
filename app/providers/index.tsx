'use client';

import { ReactNode } from 'react';
import ReduxProvider from './ReduxProvider';
import QueryProvider from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <ThemeProvider>
        <QueryProvider>
           <Toaster position="top-right" />
          {children}
        </QueryProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}