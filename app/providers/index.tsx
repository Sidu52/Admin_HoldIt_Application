'use client';

import { ReactNode } from 'react';
import ReduxProvider from './ReduxProvider';
import QueryProvider from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "./SocketProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <ThemeProvider>
        <QueryProvider>
          <SocketProvider>
            <Toaster position="top-right" />
            {children}
          </SocketProvider>
        </QueryProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}