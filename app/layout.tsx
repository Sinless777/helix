// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import { Inter, Pinyon_Script, Lora } from 'next/font/google';
import Script from 'next/script';
import React from 'react';

import { BackgroundImage } from '@/components/Background';
import MuiAppTheme from '@/components/MuiAppTheme';
import { Providers } from '@/components/providers';
import { getClerkAppearance } from '@/components/theme';
import { cn } from '@/lib/utils';

const pinyon = Pinyon_Script({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pinyon',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://helixai.com'),
  title: { default: 'Helix AI', template: '%s | Helix AI' },
  description:
    'Helix AI is your adaptive digital companion — connect, automate, and analyze across your ecosystem.',
  keywords: [
    'Helix AI',
    'AI assistant',
    'automation',
    'productivity',
    'Convex',
    'Clerk',
    'Next.js',
  ],
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
    images: [
      {
        url: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Helix_OG.png',
        width: 1200,
        height: 630,
        alt: 'Helix AI',
      },
    ],
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
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const mode: 'dark' | 'light' = 'dark';
  const clerkAppearance = getClerkAppearance(mode);

  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html
        lang="en"
        className={`${inter.variable} ${lora.variable} ${pinyon.variable} ${
          mode === 'dark' ? 'dark' : ''
        }`}
        style={{ colorScheme: mode }}
        suppressHydrationWarning
      >
        <head>
          {/* AdSense Meta Tag */}
          <meta name="google-adsense-account" content="ca-pub-9610840170359196" />

          {/* Google Analytics / GTM */}
          <Script async src="https://www.googletagmanager.com/gtag/js?id=G-EXCL6FMDHY" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-EXCL6FMDHY');
            `}
          </Script>
        </head>
        <body className={cn('antialiased', 'bg-black text-white')}>
          <Analytics />
          <SpeedInsights />
          <MuiAppTheme>
            <Providers>
              <BackgroundImage
                imageUrl="https://cdn.sinlessgamesllc.com/Helix-AI/images/Background.webp"
                altText="Background Image"
              >
                {children}
              </BackgroundImage>
            </Providers>
          </MuiAppTheme>
        </body>
      </html>
    </ClerkProvider>
  );
}
