'use client';

import { SignInButton as ClerkSignInButton } from '@clerk/nextjs';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

/**
 * Custom themed SignInButton that matches Helix AI's design system.
 * - Uses MUI Button for consistent theming (colors, radius, hover).
 * - Automatically adapts to light/dark mode via the MUI palette.
 */
export function SignInButton() {
  const theme = useTheme();

  return (
    <ClerkSignInButton mode="modal">
      <Button
        variant="contained"
        sx={{
          fontFamily: '"Lora", serif',
          fontWeight: 600,
          textTransform: 'uppercase',
          borderRadius: 2,
          letterSpacing: '0.05em',
          px: 3,
          py: 1,
          color: theme.palette.getContrastText(theme.palette.primary.main),
          backgroundColor: theme.palette.primary.main,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: theme.palette.secondary.main,
            boxShadow: `0 0 12px ${theme.palette.secondary.main}80`,
          },
        }}
      >
        Sign In
      </Button>
    </ClerkSignInButton>
  );
}

export default SignInButton;
