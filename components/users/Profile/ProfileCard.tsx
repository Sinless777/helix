// app/[user-id]/page.tsx
import { Box } from '@mui/material';

type ProfileCardProps = {
  name: string;
  username: string;
  bio?: string | null | undefined;
  avatarUrl?: string | undefined;
  status?: string | undefined;
  joinedAt?: string | undefined;
};

export function ProfileCard({
  name,
  username,
  bio,
  avatarUrl,
  status,
  joinedAt,
}: ProfileCardProps) {
  return (
    <Box sx={{ width: 600, p: 2, borderRadius: 2, boxShadow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={`${name}'s avatar`}
            style={{ width: 64, height: 64, borderRadius: '50%', marginRight: 16 }}
          />
        ) : (
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'grey.300', mr: 2 }} />
        )}
        <Box>
          <Box component="div" sx={{ fontWeight: 700 }}>
            {name}
          </Box>
          <Box component="div" sx={{ color: 'text.secondary' }}>
            @{username}
          </Box>
        </Box>
      </Box>
      {bio ? <Box sx={{ mt: 2 }}>{bio}</Box> : null}
      <Box sx={{ mt: 1, color: 'text.secondary' }}>
        {status ?? ''} {joinedAt ? `• Joined ${new Date(joinedAt).toLocaleDateString()}` : ''}
      </Box>
    </Box>
  );
}
