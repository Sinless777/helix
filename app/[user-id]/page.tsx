// app/[user-id]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Box, Grid } from '@mui/material'

import { auth } from '@clerk/nextjs/server'
import { getUserData } from '@/lib/users/users'
import { getProfile } from '@/lib/users/profile'
import { getLinkedAccounts } from '@/lib/users/accounts'
import { ProfileLayout } from '@/components/users/Profile/wrapper'
import Header from '@/components/Header'
import { headerProps } from '@/content/header'
import ProfileDetails from '@/components/users/Profile/ProfileDetails'
import ProfileAccountsCard from '@/components/users/Profile/ProfileAccountsCard'
import PaymentsPanel from '@/components/payments/PaymentsPanel'
import SubscriptionPanel from '@/components/subscriptions/SubscriptionPanel'
import SupportTicketsPanel from '@/components/support/SupportTicketsPanel'
import { roleRank } from '@/content/constants/roles'

type PageParams = { 'user-id': string }
type PageProps = { params: Promise<PageParams> }

// --- Metadata ---
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const resolved = await props.params?.catch?.(() => undefined)
  const userId = resolved?.['user-id']

  if (!userId)
    return { title: 'User', description: 'User profile on Helix AI' }

  const user = await getUserData(userId)
  const title = user ? `${user.name} (@${user.username ?? user.id})` : 'User'
  const desc = user?.about || `View ${user?.name ?? userId}'s profile on Helix AI.`

  return {
    title,
    description: desc,
    openGraph: { title, description: desc, type: 'profile' },
    twitter: { card: 'summary', title, description: desc },
  }
}

// --- Page ---
export default async function AboutUserPage(props: PageProps) {
  // Safely unwrap params (Next 16 passes a Promise)
  const resolved = await props.params?.catch?.(() => undefined)
  const userId = resolved?.['user-id']
  if (!userId) notFound()

  const [authResult, user] = await Promise.all([
    auth().catch(() => ({ userId: null })),
    getUserData(userId),
  ])
  if (!user) notFound()

  // 🔄 Sync profile features from Clerk via our API route first.
  // We use a relative fetch which works on the server in Next.js runtime.
  // If it fails, we continue gracefully and fall back to getProfile().
  let syncedProfile: any | null = null
  try {
    const res = await fetch(
      `/api/V1/${encodeURIComponent(user.id)}/profile`,
      { cache: 'no-store', next: { revalidate: 0 } }
    )
    if (res.ok) {
      syncedProfile = await res.json().catch(() => null)
    }
  } catch {
    // ignore; we'll fall back below
  }

  // Fetch the profile and linked accounts (profile may already be on `user`)
  const [profile, accounts] = await Promise.all([
    syncedProfile ?? user.profile ?? getProfile(user.id),
    getLinkedAccounts(user.id),
  ])
  if (!profile) notFound()

  const avatarUrl = user.avatarUrl
  const viewerId = authResult?.userId ?? null
  const isAuthenticated = viewerId !== null
  const canEdit = viewerId === user.id

  const clerkFeatures = Array.isArray(user.features)
    ? user.features.map((feature) => feature?.toString()).filter((feature): feature is string => Boolean(feature))
    : []
  const mergedFeatures = clerkFeatures.length > 0 ? clerkFeatures : profile.features ?? []
  const profileWithFeatures = { ...profile, features: mergedFeatures }

  const role: keyof typeof roleRank = profileWithFeatures.role ?? 'user'
  const features = profileWithFeatures.features ?? []
  const canModerate = roleRank[role] >= roleRank.moderator
  const ticketFeatureEnabled = features.includes('ticket_system') || canModerate

  const layoutName =
    [profileWithFeatures?.firstName, profileWithFeatures?.middleName, profileWithFeatures?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || user.name

  const layoutUser =
    avatarUrl !== undefined
      ? { name: layoutName, avatarUrl }
      : { name: layoutName }

  return (
    <Box>
      <Header {...headerProps} pages={[...headerProps.pages]} />
      <ProfileLayout
        user={layoutUser}
        userId={user.id}
        sections={{
          profile: (
            <Box sx={{ pt: 2, pb: 4, display: 'flex', justifyContent: 'center' }}>
              <Grid container spacing={2} alignItems="stretch">
                <Grid size={{ xs: 12, lg: 8 }} sx={{ display: 'flex' }}>
                  <ProfileDetails
                    user={{
                      id: user.id,
                      name: layoutName,
                      username: user.username ?? null,
                      avatarUrl: avatarUrl ?? null,
                      createdAt: user.createdAt ?? null,
                      bio: user.bio ?? null,
                      about: user.about ?? null,
                    }}
                    profile={{
                      userId: profileWithFeatures.userId,
                      firstName: profileWithFeatures.firstName ?? null,
                      middleName: profileWithFeatures.middleName ?? null,
                      lastName: profileWithFeatures.lastName ?? null,
                      gender: profileWithFeatures.gender ?? null,
                      sex: profileWithFeatures.sex ?? null,
                      sexuality: profileWithFeatures.sexuality ?? null,
                      genderCustom: profileWithFeatures.genderCustom ?? null,
                      sexCustom: profileWithFeatures.sexCustom ?? null,
                      sexualityCustom: profileWithFeatures.sexualityCustom ?? null,
                      bio: profileWithFeatures.bio ?? null,
                      profession: profileWithFeatures.profession ?? null,
                      gradeLevel: profileWithFeatures.gradeLevel ?? null,
                      country: profileWithFeatures.country ?? null,
                      mailingAddress: profileWithFeatures.mailingAddress ?? null,
                      features: profileWithFeatures.features ?? [],
                      isPaid: profileWithFeatures.isPaid ?? false,
                      subscriptionPlan: profileWithFeatures.subscriptionPlan ?? null,
                      settingsId: profileWithFeatures.settingsId ?? null,
                      version: profileWithFeatures.version ?? 1,
                      role: profileWithFeatures.role ?? 'user',
                    }}
                    canEdit={canEdit}
                    isAuthenticated={isAuthenticated}
                  />
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex' }}>
                  <ProfileAccountsCard
                    userId={user.id}
                    accounts={accounts}
                    canManage={canEdit}
                    fallbackManageHref={`/${encodeURIComponent(user.id)}/settings/accounts`}
                  />
                </Grid>
              </Grid>
            </Box>
          ),
          payments: (
            <Box sx={{ pt: 2, pb: 4 }}>
              <PaymentsPanel />
            </Box>
          ),
          subscriptions: (
            <Box sx={{ pt: 2, pb: 4 }}>
              <SubscriptionPanel />
            </Box>
          ),
          support: (
            <SupportTicketsPanel
              canCreate={ticketFeatureEnabled && isAuthenticated}
              canModerate={canModerate}
            />
          ),
        }}
      />
    </Box>
  )
}
