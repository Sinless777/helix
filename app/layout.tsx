// app/layout.tsx
import React from 'react'
import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from '@/components/providers'
import { BackgroundImage } from '@/components/Background'
import { cn } from '@/lib/utils'
import { Inter, Pinyon_Script, Lora } from 'next/font/google'
import { getClerkAppearance } from '@/components/theme'
import MuiAppTheme from '@/components/MuiAppTheme'
import { DevelopmentBanner } from '@/components/development-banner'

const pinyon = Pinyon_Script({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pinyon',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://helixai.com'),
  title: { default: 'Helix AI', template: '%s | Helix AI' },
  description:
    'Helix AI is your adaptive digital companion — connect, automate, and analyze across your ecosystem.',
  keywords: ['Helix AI', 'AI assistant', 'automation', 'productivity', 'Convex', 'Clerk', 'Next.js'],
  applicationName: 'Helix AI',
  authors: [{ name: 'SinLess Games LLC', url: 'https://sinlessgamesllc.com' }],
  creator: 'SinLess Games LLC',
  publisher: 'SinLess Games LLC',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://helixai.com' },
  openGraph: {
    title: 'Helix AI',
    description:
      'Your adaptive digital companion — connect, automate, and analyze across your ecosystem.',
    url: 'https://helixai.com',
    siteName: 'Helix AI',
    images: [{ url: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Helix_OG.png', width: 1200, height: 630, alt: 'Helix AI' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Sinless777',
    creator: '@Sinless777',
    title: 'Helix AI',
    description:
      'Your adaptive digital companion — connect, automate, and analyze across your ecosystem.',
    images: ['https://cdn.sinlessgamesllc.com/Helix-AI/images/Helix_OG.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // For now your site is dark-only. If you later add toggling, keep this
  // html setup and swap the class/style before hydration.
  const mode: 'dark' | 'light' = 'dark'
  const clerkAppearance = getClerkAppearance(mode)

  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html
        lang="en"
        className={`${inter.variable} ${lora.variable} ${pinyon.variable} ${mode === 'dark' ? 'dark' : ''}`}
        style={{ colorScheme: mode }}
        suppressHydrationWarning
      >
        <MuiAppTheme>
          {/* CssBaseline is applied inside MuiAppTheme */}
          <body className={cn('antialiased', 'bg-black text-white')}>
            <Providers>
              <BackgroundImage
                imageUrl="https://cdn.sinlessgamesllc.com/Helix-AI/images/Background.webp"
                altText="Background Image"
              >
                {children}
              </BackgroundImage>
            </Providers>
          </body>
        </MuiAppTheme>
      </html>
    </ClerkProvider>
  )
}
