// app/[user-id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box } from "@mui/material";

import { auth } from "@clerk/nextjs/server";
import { getUserData } from "@/lib/users/users";
import { getProfile } from "@/lib/users/profile";
import { ProfileLayout } from "@/components/users/Profile/wrapper";
import Header from "@/components/Header";
import { headerProps } from "@/content/header";
import ProfileDetails from "@/components/users/Profile/ProfileDetails";

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

  const profile = user.profile ?? (await getProfile(user.id));
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
      <ProfileLayout user={layoutUser}>
        <Box sx={{ pt: 2, pb: 4, display: "flex", justifyContent: "center" }}>
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
            }}
            canEdit={canEdit}
            isAuthenticated={isAuthenticated}
          />
        </Box>
      </ProfileLayout>
    </Box>
  );
}
