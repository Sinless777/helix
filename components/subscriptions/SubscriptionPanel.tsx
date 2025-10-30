'use client';

// components/subscriptions/SubscriptionPanel.tsx
// Displays subscription information pulled from Clerk metadata alongside a
// Material UI shell.

import * as React from 'react';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';

function SubscriptionDetails() {
  const { user } = useUser();

  const plan = (user?.publicMetadata?.subscriptionPlan as string | undefined) ?? 'Free';
  const renewalDate = user?.publicMetadata?.subscriptionRenewal as string | undefined;
  const isPaid = Boolean(user?.publicMetadata?.isPaid);

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Your subscription
        </Typography>
        <Typography variant="body1">
          Current plan: <strong>{plan}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {renewalDate
            ? `Renews on ${new Date(renewalDate).toLocaleDateString()}`
            : 'No renewal date on record.'}
        </Typography>
        {isPaid ? null : (
          <Alert severity="info">
            Upgrade to unlock premium Helix features and priority support.
          </Alert>
        )}
        <Stack direction="row" spacing={1.5}>
          <Button variant="contained">Manage plan</Button>
          <Button variant="outlined">View invoices</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function SubscriptionPanel() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SignedOut>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Sign in required</Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in with your Helix account to manage subscriptions.
            </Typography>
            <SignInButton mode="modal">
              <Button variant="contained">Sign in</Button>
            </SignInButton>
          </CardContent>
        </Card>
      </SignedOut>

      <SignedIn>
        <SubscriptionDetails />
      </SignedIn>
    </Box>
  );
}
