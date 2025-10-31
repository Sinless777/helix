// app/technology/[link]/page.tsx
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import type { Metadata } from 'next';
import React from 'react';

import HelixCard from '@/components/Card';
import type { CardProps, ListItemProps } from '@/components/Card';
import Header from '@/components/Header';
import { headerProps } from '@/content/header';
import * as technology from '@/content/technology';

type PageProps = {
  // In Next.js 16, `params` is a Promise — unwrap with `await` or React.use()
  params: Promise<{ link: string }>;
};

// Ensure leading slash + lowercase for robust comparisons
function norm(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return p.toLowerCase();
}

function getAllCards(): CardProps[] {
  return (Object.values(technology).flat() as CardProps[]).filter(Boolean);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { link } = await params;
  const slug = decodeURIComponent(link || '');
  const target = norm(`/technology/${slug}`);
  const card = getAllCards().find((c) => norm(c.link ?? '') === target);

  return {
    title: card?.title ?? 'Technology',
    description: card?.description ?? 'Explore Helix AI technologies.',
  };
}

export default async function Page({ params }: PageProps) {
  const { link } = await params;
  const slug = decodeURIComponent(link || '');
  const target = norm(`/technology/${slug}`);

  const allCards = getAllCards();
  const matchedCard = allCards.find((c) => norm(c.link ?? '') === target);

  if (!matchedCard) {
    return (
      <main>
        <Header {...headerProps} pages={[...headerProps.pages]} />
        <Container maxWidth="md" sx={{ textAlign: 'center', pt: { xs: 10, md: 14 } }}>
          <Typography variant="h4" gutterBottom>
            Oops — page not found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            We couldn&apos;t find a technology matching <strong>{slug}</strong>.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" href="/technology">
              Back to Technologies
            </Button>
          </Box>
        </Container>
      </main>
    );
  }

  const { title, description, listItems } = matchedCard;

  return (
    <main>
      <Header {...headerProps} pages={[...headerProps.pages]} />

      <Box
        component="section"
        sx={{
          pt: { xs: 8, sm: 10, md: 12, lg: 14 },
          pb: { xs: 4, md: 6 },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              textAlign: 'center',
              mb: 3,
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography variant="h2" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {description && (
              <Typography
                variant="body1"
                sx={{ color: 'text.secondary', mt: 1, maxWidth: 900, mx: 'auto' }}
              >
                {description}
              </Typography>
            )}
          </Box>

          <Grid
            container
            spacing={2}
            sx={{
              alignContent: 'center',
              alignItems: 'stretch',
              justifyContent: 'center',
            }}
          >
            {(listItems as ListItemProps[] | undefined)?.map((item, idx) => (
              <Grid key={`${item.href}-${idx}`} size={{ xs: 12, sm: 6, md: 4 }}>
                <HelixCard
                  title={item.text}
                  image={item.image ?? ''}
                  description={item.detailedDescription}
                  link={item.href ?? ''}
                  sx={{ height: '30rem' }}
                />
              </Grid>
            ))}
          </Grid>

          {/* Centered Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              href="/technology"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              Back to Technologies
            </Button>
          </Box>
        </Container>
      </Box>
    </main>
  );
}
