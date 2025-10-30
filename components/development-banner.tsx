'use client';

import { Alert, AlertTitle } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import { alpha } from '@mui/material/styles';

type DevelopmentBannerProps = {
  message?: string;
  sx?: SxProps<Theme>;
};

export function DevelopmentBanner({
  message = 'This is a development environment. Features may be incomplete.',
  sx,
}: DevelopmentBannerProps) {
  return (
    <Alert
      icon={<AnnouncementIcon fontSize="small" />}
      severity="info"
      sx={{
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.info.light, 0.12)
            : alpha(theme.palette.info.light, 0.3),
        color: (theme) =>
          theme.palette.mode === 'dark'
            ? theme.palette.info.light
            : theme.palette.text.primary,
        ...sx,
      }}
    >
      <AlertTitle sx={{ fontWeight: 600, mb: 0.25 }}>Under Development: {message}</AlertTitle>
    </Alert>
  );
}

export default DevelopmentBanner;
