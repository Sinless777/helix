// app/[user-id]/support/page.tsx
import type { Metadata, Route } from 'next';
import { redirect } from 'next/navigation';
import { Container, Stack, Typography, Divider } from '@mui/material';
import { auth } from '@clerk/nextjs/server';
import { getProfile } from '@/lib/users/profile';
import { getUserData } from '@/lib/users/users';
import SupportTicketsPanel from '@/components/support/SupportTicketsPanel';
import { roleRank } from '@/content/constants/roles';

export const metadata: Metadata = {
  title: 'Support Tickets | Helix AI',
  description: 'Submit and review Helix support tickets.',
};

type PageParams = { 'user-id': string };
type PageProps = { params: Promise<PageParams> };

export default async function SupportPage(props: PageProps) {
  const resolved = await props.params.catch(() => ({ 'user-id': '' }));
  const routeUserId = resolved['user-id'];

  if (!routeUserId) redirect('/');

  const [authResult, targetUser] = await Promise.all([
    auth().catch(() => ({ userId: null })),
    getUserData(routeUserId),
  ]);

  if (!targetUser) redirect('/');

  const viewerId = authResult?.userId ?? null;
  if (!viewerId) {
    const destination = `/sign-in?redirect_url=/${encodeURIComponent(
      routeUserId
    )}/support` as Route;
    redirect(destination);
  }

  const profile = await getProfile(viewerId);
  const role = profile.role ?? 'user';
  const features = profile.features ?? [];
  const canModerate = roleRank[role] >= roleRank.moderator;

  if (viewerId !== routeUserId && !canModerate) {
    const destination = `/${encodeURIComponent(viewerId)}/support` as Route;
    redirect(destination);
  }

  const canCreate =
    (features.includes('ticket_system') || canModerate) && viewerId === routeUserId;

  return (
    <Container
      maxWidth="md"
      sx={{
        py: { xs: 4, sm: 6 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Stack
        spacing={3}
        alignItems="center"
        textAlign="center"
        sx={{ width: '100%', mb: { xs: 2, sm: 3 } }}
      >
        <Typography
          variant="h3"
          fontFamily="var(--font-pinyon)"
          fontWeight={700}
          textAlign="center"
          sx={{
            fontSize: {
              xs: '2.2rem',
              sm: '2.8rem',
              md: '3.2rem',
            },
            letterSpacing: '0.5px',
          }}
        >
          Support Tickets
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          maxWidth="sm"
          sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
        >
          Submit a support request or track the status of your existing conversations with the Helix team.
        </Typography>

        <Divider sx={{ width: '60px', my: 2, borderColor: 'divider' }} />
      </Stack>

      <SupportTicketsPanel canCreate={canCreate} canModerate={canModerate} />
    </Container>
  );
}
