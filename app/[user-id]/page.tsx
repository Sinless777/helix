// app/[user-id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box, Grid } from "@mui/material";

import { auth } from "@clerk/nextjs/server";
import { getUserData } from "@/lib/users/users";
import { getProfile } from "@/lib/users/profile";
import { getLinkedAccounts } from "@/lib/users/accounts";
import { ProfileLayout } from "@/components/users/Profile/wrapper";
import Header from "@/components/Header";
import { headerProps } from "@/content/header";
import ProfileDetails from "@/components/users/Profile/ProfileDetails";
import ProfileAccountsCard from "@/components/users/Profile/ProfileAccountsCard";
import PaymentsPanel from "@/components/payments/PaymentsPanel";
import SubscriptionPanel from "@/components/subscriptions/SubscriptionPanel";

type PageParams = { "user-id": string };
type PageProps = { params: Promise<PageParams> };

// --- Metadata ---
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const resolved = await props.params?.catch?.(() => undefined);
  const userId = resolved?.["user-id"];

  if (!userId)
    return { title: "User", description: "User profile on Helix AI" };

  const user = await getUserData(userId);
  const title = user ? `${user.name} (@${user.username ?? user.id})` : "User";
  const desc =
    user?.about || `View ${user?.name ?? userId}'s profile on Helix AI.`;

  return {
    title,
    description: desc,
    openGraph: { title, description: desc, type: "profile" },
    twitter: { card: "summary", title, description: desc },
  };
}

// --- Page ---
export default async function AboutUserPage(props: PageProps) {
  // Safely unwrap params (Next 16 passes a Promise)
  const resolved = await props.params?.catch?.(() => undefined);
  const userId = resolved?.["user-id"];

  if (!userId) notFound();

  const [authResult, user] = await Promise.all([
    auth().catch(() => ({ userId: null })),
    getUserData(userId),
  ]);
  if (!user) notFound();

  // Fetch the profile (ensuring we hydrate virtual defaults) and any linked
  // external accounts in parallel so the page can render both cards together.
  const [profile, accounts] = await Promise.all([
    user.profile ?? getProfile(user.id),
    getLinkedAccounts(user.id),
  ]);
  if (!profile) notFound();

  const avatarUrl = user.avatarUrl;

  const viewerId = authResult?.userId ?? null;
  const isAuthenticated = viewerId !== null;
  const canEdit = viewerId === user.id;

  const layoutName = [profile?.firstName, profile?.middleName, profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim() || user.name;

  const layoutUser =
    avatarUrl !== undefined
      ? { name: layoutName, avatarUrl }
      : { name: layoutName };

  return (
    <Box>
      <Header {...headerProps} pages={[...headerProps.pages]} />
      <ProfileLayout
        user={layoutUser}
        userId={user.id}
        sections={{
          profile: (
            <Box sx={{ pt: 2, pb: 4, display: "flex", justifyContent: "center" }}>
              <Grid container spacing={2} alignItems="stretch">
                <Grid size={{ xs: 12, lg: 8 }} sx={{ display: "flex" }}>
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
                      userId: profile.userId,
                      firstName: profile.firstName ?? null,
                      middleName: profile.middleName ?? null,
                      lastName: profile.lastName ?? null,
                      gender: profile.gender ?? null,
                      sex: profile.sex ?? null,
                      sexuality: profile.sexuality ?? null,
                      genderCustom: profile.genderCustom ?? null,
                      sexCustom: profile.sexCustom ?? null,
                      sexualityCustom: profile.sexualityCustom ?? null,
                      bio: profile.bio ?? null,
                      profession: profile.profession ?? null,
                      gradeLevel: profile.gradeLevel ?? null,
                      country: profile.country ?? null,
                      mailingAddress: profile.mailingAddress ?? null,
                      features: profile.features ?? [],
                      isPaid: profile.isPaid ?? false,
                      subscriptionPlan: profile.subscriptionPlan ?? null,
                      settingsId: profile.settingsId ?? null,
                      version: profile.version ?? 1,
                    }}
                    canEdit={canEdit}
                    isAuthenticated={isAuthenticated}
                  />
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }} sx={{ display: "flex" }}>
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
        }}
      />
    </Box>
  );
}
