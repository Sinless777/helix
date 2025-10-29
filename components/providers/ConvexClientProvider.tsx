'use client'

import { ReactNode } from 'react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { useAuth } from '@clerk/nextjs'

// Validate environment early (at build/runtime)
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
if (!convexUrl) {
  throw new Error('❌ Missing NEXT_PUBLIC_CONVEX_URL in environment variables')
}

// Create a single shared Convex client instance
const convex = new ConvexReactClient(convexUrl)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}

export default ConvexClientProvider
