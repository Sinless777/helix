'use client'

import React from 'react'
import ConvexClientProvider from './ConvexClientProvider'
import NextThemeProvider from './NextThemeProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexClientProvider>
      <NextThemeProvider>{children}</NextThemeProvider>
    </ConvexClientProvider>
  )
}

export default Providers
