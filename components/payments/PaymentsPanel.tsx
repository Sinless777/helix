'use client';

// components/payments/PaymentsPanel.tsx
// Payment management shell using Clerk session context and Material UI.

import * as React from 'react';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

function PaymentMethods() {
  const { user } = useUser();
  const methods = (user?.publicMetadata?.paymentMethods as Array<{ brand: string; last4: string }> | undefined) ?? [];

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Payment methods
        </Typography>

        {methods.length === 0 ? (
          <Alert severity="info">No saved payment methods yet.</Alert>
        ) : (
          <List>
            {methods.map((method, index) => (
              <ListItem key={`${method.brand}-${method.last4}-${index}`} disableGutters>
                <ListItemText
                  primary={`${method.brand} ending in ${method.last4}`}
                  secondary="Primary billing method"
                />
              </ListItem>
            ))}
          </List>
        )}

        <Stack direction="row" spacing={1.5}>
          <Button variant="contained">Add payment method</Button>
          <Button variant="outlined">Open billing portal</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function PaymentsPanel() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SignedOut>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Sign in required</Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in with your Helix account to manage payment settings.
            </Typography>
            <SignInButton mode="modal">
              <Button variant="contained">Sign in</Button>
            </SignInButton>
          </CardContent>
        </Card>
      </SignedOut>

      <SignedIn>
        <PaymentMethods />
      </SignedIn>
    </Box>
  );
}
