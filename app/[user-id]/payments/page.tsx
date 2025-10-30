// app/[user-id]/payments/page.tsx
// Payment settings landing page using Clerk context for authentication.

import type { Metadata, Route } from 'next';
import { redirect } from 'next/navigation';
import { Container, Stack, Typography } from '@mui/material';
import { auth } from '@clerk/nextjs/server';
import PaymentsPanel from '@/components/payments/PaymentsPanel';

export const metadata: Metadata = {
  title: 'Payments | Helix AI',
  description: 'Manage payment methods and billing preferences for Helix.',
};

type PageParams = { 'user-id': string };
type PageProps = { params: Promise<PageParams> };

export default async function PaymentsPage(props: PageProps) {
  const resolved = await props.params.catch(() => ({ 'user-id': '' }));
  const routeUserId = resolved['user-id'];

  if (!routeUserId) {
    redirect('/');
  }

  const authResult = await auth().catch(() => ({ userId: null }));
  const userId = authResult?.userId;

  if (!userId) {
    const destination = `/sign-in?redirect_url=/${encodeURIComponent(routeUserId)}/payments` as Route;
    redirect(destination);
  }

  if (userId !== routeUserId) {
    const ownPayments = `/${encodeURIComponent(userId)}/payments` as Route;
    redirect(ownPayments);
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4" fontFamily="var(--font-pinyon)">
            Payments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update payment methods and review billing information.
          </Typography>
        </Stack>

        <PaymentsPanel />
      </Stack>
    </Container>
  );
}
