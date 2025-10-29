// app/Contact/page.tsx
'use client'

import React from 'react'
import Header from '@/components/Header'
import { headerProps } from '@/content/header'
import { CONTACT_OPTIONS } from '@/content/contact'
import HelixCard from '@/components/Card'

import { Box, Container, Typography } from '@mui/material'
// If your project is on MUI v6 with Grid v2 as default, this import is fine:
import Grid from '@mui/material/Grid' // v2 API (supports `size`)

export default function ContactPage() {
  return (
    <main>
      <Header {...headerProps} pages={[...headerProps.pages]} />

      <Box
        component="section"
        sx={{
          pt: { xs: 8, sm: 10, md: 12, lg: 14 },
          pb: { xs: 4, md: 6 },
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{ fontWeight: 700, mb: 3 }}
          >
            Contact Us
          </Typography>

          <Grid container spacing={2} sx={{ alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
            {CONTACT_OPTIONS.map((option) => (
              <Grid key={option.title} size={{ xs: 12, sm: 6, md: 4 }}>
                <HelixCard
                  title={option.title}
                  description={option.description}
                  image={option.image ?? ''}
                  link={option.link}
                  buttonText={option.buttonText}
                  sx={{
                    // Let each card pick up its accent from the content config
                    borderColor: option.bgColor ?? undefined,
                    // Slight tinted overlay to echo your brand blue if provided
                    ...(option.bgColor
                      ? { backgroundColor: 'rgba(0,0,0,0.40)' }
                      : {}),
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </main>
  )
}
