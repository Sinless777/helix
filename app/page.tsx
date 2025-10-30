'use client'

import { DevelopmentBanner } from '@/components/development-banner'
import Header from '@/components/Header'
import { HeroSection } from '@/components/Waitlist'
import { headerProps } from '@/content/header'
import { cn } from '@/lib/utils'

const HERO_DATA = {
  title: 'Meet Helix AI — Your Intelligent Companion for a Smarter Digital Life',
  description:
    'Seamlessly connect, automate, and analyze with an AI assistant built to simplify tasks, enhance productivity, and empower your decisions across every platform you use.',
  imageUrl: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Helix_Logo.png',
} as const

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Skip link for keyboard users */}
      <a
        href="#main"
        className={cn(
          'sr-only focus:not-sr-only',
          'fixed left-4 top-4 z-[60] rounded-md bg-white/10 px-3 py-2 text-sm backdrop-blur hover:bg-white/20'
        )}
      >
        Skip to content
      </a>

      {/* Fixed gradient header */}
      <Header {...headerProps} pages={[...headerProps.pages]} />
      <DevelopmentBanner sx={{ mb: 2 }} />

      {/* Page content */}
      <main id="main" className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 xl:pt-32">
        <div className="space-y-8">
          <HeroSection
            title={HERO_DATA.title}
            subtitle={HERO_DATA.description}
            imageUrl={HERO_DATA.imageUrl}
            imageAlt="Helix AI Visual"
          />
        </div>
      </main>
    </div>
  )
}
