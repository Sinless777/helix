'use client';

import { SignUpButton as ClerkSignUpButton } from '@clerk/nextjs';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

/**
 * Helix-themed SignUp button that opens Clerk's modal.
 * Ensures the Clerk component stays PascalCase and in scope.
 */
export function SignUpButton() {
  const theme = useTheme();

  return (
    <ClerkSignUpButton mode="modal">
      <Button
        variant="outlined"
        sx={{
          fontFamily: '"Lora", serif',
          fontWeight: 600,
          textTransform: 'uppercase',
          borderRadius: 2,
          letterSpacing: '0.05em',
          px: 3,
          py: 1,
          color: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
          transition: 'all 0.2s ease',
          '&:hover': {
            color: theme.palette.secondary.main,
            borderColor: theme.palette.secondary.main,
            boxShadow: `0 0 12px ${theme.palette.secondary.main}80`,
          },
        }}
      >
        Register
      </Button>
    </ClerkSignUpButton>
  );
}

export default SignUpButton;
