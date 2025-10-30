'use client'

import React from 'react'
import ConvexClientProvider from './ConvexClientProvider'
import NextThemeProvider from './NextThemeProvider'
import FaroProvider from './FaroProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexClientProvider>
      <FaroProvider>
        <NextThemeProvider>{children}</NextThemeProvider>
      </FaroProvider>
    </ConvexClientProvider>
  )
}

export default Providers
