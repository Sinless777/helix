'use client';

// components/ui/GlassCard.tsx
// Reusable glassmorphism card that pulls colors from the theme constants.

import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { themes } from '@/content/constants/theme';

export interface GlassCardProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  component?: React.ElementType;
}

export default function GlassCard({ children, sx, component = 'div' }: GlassCardProps) {
  const muiTheme = useTheme();
  const mode = muiTheme.palette.mode === 'dark' ? 'dark' : 'light';
  const palette = themes[mode];

  return (
    <Box
      component={component}
      sx={{
        position: 'relative',
        borderRadius: 3,
        padding: 3,
        backdropFilter: 'blur(18px) saturate(140%)',
        WebkitBackdropFilter: 'blur(18px) saturate(140%)',
        border: `1px solid ${palette.border.rgba}`,
        backgroundColor: palette.surfaceTransparent.rgba,
        boxShadow:
          mode === 'dark'
            ? '0 24px 48px rgba(0, 0, 0, 0.35)'
            : '0 24px 48px rgba(17, 25, 40, 0.15)',
        transition: 'box-shadow 200ms ease, transform 200ms ease',
        '&:hover': {
          boxShadow:
            mode === 'dark'
              ? '0 28px 60px rgba(0, 0, 0, 0.45)'
              : '0 28px 60px rgba(17, 25, 40, 0.22)',
          transform: 'translateY(-2px)',
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
