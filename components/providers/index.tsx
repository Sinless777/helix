'use client';

import React from 'react';

import ConvexClientProvider from './ConvexClientProvider';
import FaroProvider from './FaroProvider';
import NextThemeProvider from './NextThemeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexClientProvider>
      <FaroProvider>
        <NextThemeProvider>{children}</NextThemeProvider>
      </FaroProvider>
    </ConvexClientProvider>
  );
}

export default Providers;
