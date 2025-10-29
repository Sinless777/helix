'use client'

import * as React from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { getMuiTheme } from '@/components/theme'
import { type Mode } from '@/content/constants/theme'

type Props = {
  mode?: Mode
  children: React.ReactNode
}

/**
 * Client-only wrapper that builds the MUI theme and provides it via context.
 * This avoids sending a non-serializable theme (with functions) from the Server Component.
 */
export default function MuiAppTheme({ mode = 'dark', children }: Props) {
  const theme = React.useMemo(() => getMuiTheme(mode), [mode])
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
