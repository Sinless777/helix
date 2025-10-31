// app/[user-id]/settings/page.tsx
// Server component that loads a member's encrypted settings and renders the
// client form for editing them.

import { auth } from '@clerk/nextjs/server';
import { Container, Stack, Typography } from '@mui/material';
import type { Metadata, Route } from 'next';
import { redirect } from 'next/navigation';

import SettingsForm from '@/components/settings/SettingsForm';
import { getUserSettings } from '@/lib/users/settings';

export const metadata: Metadata = {
  title: 'Settings | Helix AI',
  description: 'Manage personal settings for your Helix account.',
};

type PageParams = { 'user-id': string };
type PageProps = { params: Promise<PageParams> };

export default async function SettingsPage(props: PageProps) {
  const resolved = await props.params.catch(() => ({ 'user-id': '' }));
  const routeUserId = resolved['user-id'];

  if (!routeUserId) {
    redirect('/');
  }

  const authResult = await auth().catch(() => ({ userId: null }));
  const userId = authResult?.userId;

  if (!userId) {
    const destination =
      `/sign-in?redirect_url=/${encodeURIComponent(routeUserId)}/settings` as Route;
    redirect(destination);
  }

  if (userId !== routeUserId) {
    const ownSettings = `/${encodeURIComponent(userId)}/settings` as Route;
    redirect(ownSettings);
  }

  const userSettings = await getUserSettings(routeUserId);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4" fontFamily="var(--font-pinyon)">
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update your preferences and how Helix connects to other services.
          </Typography>
        </Stack>

        <SettingsForm
          userId={userSettings.userId}
          initialSettings={userSettings.settings}
          version={userSettings.version}
        />
      </Stack>
    </Container>
  );
}
