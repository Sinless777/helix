// components/users/Profile/topbar.tsx
"use client";

import * as React from "react";
import { Box, Typography, IconButton, Stack } from "@mui/material";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export interface ProfileTopbarProps {
  user: { name: string; avatarUrl?: string };
  embedded?: boolean; // when true, renders flat to merge with sidebar container
  sx?: SxProps<Theme>;
}

export default function ProfileTopbar({ user, embedded, sx }: ProfileTopbarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        ...(embedded
          ? { bgcolor: "transparent" } // inherits glass from parent
          : { borderRadius: 3, p: 1.5 }),
        ...sx,
      }}
    >
      <Box>
        <Typography variant="h6" fontWeight={700} lineHeight={1.1}>
          Hello, {user.name}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Welcome back!
        </Typography>
      </Box>

      <Stack direction="row" spacing={1}>
        <IconButton size="small" aria-label="messages">
          <MailOutlineIcon />
        </IconButton>
        <IconButton size="small" aria-label="notifications">
          <NotificationsNoneIcon />
        </IconButton>
        <IconButton size="small" aria-label="profile">
          <AccountCircleIcon />
        </IconButton>
      </Stack>
    </Box>
  );
}
