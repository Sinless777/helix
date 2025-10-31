// app/[user-id]/subscriptions/page.tsx
// Subscription management landing page guarded by Clerk.

import { auth } from '@clerk/nextjs/server';
import { Container, Stack, Typography } from '@mui/material';
import type { Metadata, Route } from 'next';
import { redirect } from 'next/navigation';

import SubscriptionPanel from '@/components/subscriptions/SubscriptionPanel';

export const metadata: Metadata = {
  title: 'Subscriptions | Helix AI',
  description: 'Review and manage your Helix subscription.',
};

type PageParams = { 'user-id': string };
type PageProps = { params: Promise<PageParams> };

export default async function SubscriptionsPage(props: PageProps) {
  const resolved = await props.params.catch(() => ({ 'user-id': '' }));
  const routeUserId = resolved['user-id'];

  if (!routeUserId) {
    redirect('/');
  }

  const authResult = await auth().catch(() => ({ userId: null }));
  const userId = authResult?.userId;

  if (!userId) {
    const destination =
      `/sign-in?redirect_url=/${encodeURIComponent(routeUserId)}/subscriptions` as Route;
    redirect(destination);
  }

  if (userId !== routeUserId) {
    const ownSubscriptions = `/${encodeURIComponent(userId)}/subscriptions` as Route;
    redirect(ownSubscriptions);
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4" fontFamily="var(--font-pinyon)">
            Subscriptions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Adjust your plan, view invoices, and manage renewals.
          </Typography>
        </Stack>

        <SubscriptionPanel />
      </Stack>
    </Container>
  );
}
