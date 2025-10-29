// app/Technology/page.tsx
'use client'

import React, { useEffect, useMemo } from 'react'
import Script from 'next/script'
import Header from '@/components/Header'
import { headerProps } from '@/content/header'
import HelixCard from '@/components/Card'
import type { CardProps } from '@/components/Card'
import * as Constants from '@/content/technology'

import { Box, Container, Typography } from '@mui/material'
import Grid from '@mui/material/Grid' // MUI v2 Grid (supports `size`)

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>
  }
}

export default function Technology() {
  // Build & sort once
  const allCards = useMemo<CardProps[]>(() => {
    const cards = Object.values(Constants).flat() as CardProps[]
    return [...cards].sort((a, b) => a.title.localeCompare(b.title))
  }, [])

  // Initialize AdSense after mount (and when card count changes)
  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // ignore locally
    }
  }, [allCards.length])

  return (
    <main>
      {/* Load AdSense (requires NEXT_PUBLIC_ADSENSE_CLIENT) */}
      {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
        <Script
          id="adsbygoogle-lib"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
          async
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}

      {/* Optional fixed side ad slots */}
      {process.env.NEXT_PUBLIC_ADSENSE_CLIENT &&
        (['left', 'right'] as const).map((side) => (
          <Box
            // Use <ins> element for AdSense via MUI
            key={side}
            component="ins"
            className="adsbygoogle"
            sx={{
              display: { xs: 'none', lg: 'block' },
              position: 'fixed',
              top: '50%',
              [side]: 0,
              transform: 'translateY(-50%)',
              width: 120,
              height: 600,
              zIndex: 40,
            }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
            data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_TECH_SIDEBAR_SLOT}
            data-ad-format="vertical"
            data-full-width-responsive="false"
            aria-hidden="true"
          />
        ))}

      <Header {...headerProps} pages={[...headerProps.pages]} />

      {/* Title + Intro */}
      <Box
        component="section"
        sx={{
          pt: { xs: 8, sm: 10, md: 12, lg: 14 },
          pb: { xs: 4, md: 6 },
          minHeight: '20vh',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" sx={{ fontWeight: 700, mb: 2 }}>
            Technology
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{
              color: 'text.secondary',
              maxWidth: 900,
              mx: 'auto',
            }}
          >
            Helix AI is built on modern, battle-tested technologies—selected for
            performance, reliability, scalability, and security. Explore the systems
            that power Helix—engineered to evolve, scale, and serve.
          </Typography>
        </Container>
      </Box>

      {/* Cards */}
      <Box component="section" sx={{ pb: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid
            container
            spacing={2}
            sx={{ alignContent: 'center', alignItems: 'stretch', justifyContent: 'center' }}
          >
            {allCards.map((card, idx) => (
              <Grid key={`${card.title}-${card.link ?? idx}`} size={{ xs: 12, sm: 6, md: 4 }}>
                <HelixCard {...card} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </main>
  )
}
