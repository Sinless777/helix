// app/[user-id]/settings/accounts/page.tsx
// Surface where a member can manage the external accounts they have linked to
// Helix. Links to the AccountsManager client component for interactivity.

import { auth } from '@clerk/nextjs/server';
import { Container, Stack, Typography } from '@mui/material';
import type { Metadata, Route } from 'next';
import { redirect } from 'next/navigation';

import AccountsManager from '@/components/settings/AccountsManager';
import { getLinkedAccounts } from '@/lib/users/accounts';

export const metadata: Metadata = {
  title: 'Account Connections | Helix AI',
  description: 'Link and manage third-party accounts connected to Helix.',
};

type PageParams = { 'user-id': string };
type PageProps = { params: Promise<PageParams> };

export default async function AccountConnectionsPage(props: PageProps) {
  const resolved = await props.params.catch(() => ({ 'user-id': '' }));
  const routeUserId = resolved['user-id'];

  if (!routeUserId) {
    redirect('/');
  }

  const authResult = await auth().catch(() => ({ userId: null }));
  const userId = authResult?.userId;

  if (!userId) {
    const destination =
      `/sign-in?redirect_url=/${encodeURIComponent(routeUserId)}/settings/accounts` as Route;
    redirect(destination);
  }

  if (userId !== routeUserId) {
    const ownAccounts = `/${encodeURIComponent(userId)}/settings/accounts` as Route;
    redirect(ownAccounts);
  }

  const accounts = await getLinkedAccounts(routeUserId);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4" fontFamily="var(--font-pinyon)">
            Account connections
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Control which services stay linked to Helix.
          </Typography>
        </Stack>

        <AccountsManager userId={routeUserId} initialAccounts={accounts} />
      </Stack>
    </Container>
  );
}
