// app/[user-id]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import { headerProps } from '@/content/header'
import { getUserData } from '@/lib/users/users'
import { getProfile } from '@/lib/users/profile'

type PageProps = {
  // In Next 15/16, params is a Promise in Server Components
  params: Promise<{ 'user-id': string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { 'user-id': userParam } = await params
  const user = await getUserData(userParam)

  const title = user ? `${user.name} (@${user.username ?? user.id})` : 'User'
  const desc =
    user?.about ||
    `View ${user?.name ?? userParam}'s profile on Helix AI.`

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description: desc,
    },
  }
}

export default async function AboutUserPage({ params }: PageProps) {
  const { 'user-id': userParam } = await params
  const user = await getUserData(userParam)

  if (!user) {
    // Proper 404 if user does not exist
    notFound()
  }

  return (
    <main>
      <Header {...headerProps} pages={[...headerProps.pages]} />

      <section
        style={{
          paddingTop: '5rem',
          paddingBottom: '2rem',
          maxWidth: 960,
          margin: '0 auto',
          paddingInline: '1rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ marginBottom: '0.25rem' }}>{user.name}</h1>
        {user.username && (
          <p style={{ opacity: 0.8, margin: 0 }}>@{user.username}</p>
        )}
        {user.createdAt && (
          <p style={{ opacity: 0.6, marginTop: '0.5rem' }}>
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
        )}

        {user.about && (
          <p style={{ marginTop: '1rem', lineHeight: 1.6 }}>{user.about}</p>
        )}
        {user.bio && !user.about && (
          <p style={{ marginTop: '1rem', lineHeight: 1.6 }}>{user.bio}</p>
        )}
      </section>
    </main>
  )
}
