// components/users/Profile/topbar.tsx
'use client';

import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  Menu,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Badge,
} from '@mui/material';
import type { SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import * as React from 'react';

import { useNotifications, type Notification } from '@/hooks/useNotifications';

export interface ProfileTopbarProps {
  user: { name: string; avatarUrl?: string };
  userId?: string;
  embedded?: boolean;
  sx?: SxProps<Theme>;
}

export default function ProfileTopbar({ user, userId, embedded, sx }: ProfileTopbarProps) {
  // Prefer explicit userId when available; fall back to user.name for backwards
  // compatibility with places that only pass a display name.
  const { notifications, markRead } = useNotifications(userId ?? user.name);
  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleBellClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleMarkRead = (notificationId: Notification['_id']) => markRead(notificationId);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...(embedded ? { bgcolor: 'transparent' } : { borderRadius: 3, p: 1.5 }),
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

      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip title="Messages" arrow>
          <IconButton size="small" aria-label="messages">
            <MailOutlineIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Notifications" arrow>
          <IconButton size="small" aria-label="notifications" onClick={handleBellClick}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        PaperProps={{ sx: { width: 300 } }}
      >
        {notifications.length > 0 ? (
          notifications.map((notif: Notification) => (
            <ListItem key={notif._id} disablePadding sx={{ alignItems: 'center' }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {/* show a small dot for unread notifications; read items show no dot */}
                {!notif.read ? (
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main' }} />
                ) : (
                  <Box
                    sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'transparent' }}
                  />
                )}
              </ListItemIcon>

              <ListItemText primary={notif.title} secondary={notif.message} />
              <ListItemSecondaryAction>
                {!notif.read && (
                  <Button size="small" onClick={() => handleMarkRead(notif._id)}>
                    Mark read
                  </Button>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No notifications" />
          </ListItem>
        )}
        <ListItem>
          <Button fullWidth onClick={handleMenuClose}>
            Close
          </Button>
        </ListItem>
      </Menu>
    </Box>
  );
}
