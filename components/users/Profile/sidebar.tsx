// components/users/Profile/sidebar.tsx
"use client";

import * as React from "react";
import {
  Badge,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

type Key = "profile" | "dashboard" | "accounts" | "payments" | "subscriptions" | "support" | "settings";

export interface SidebarItem {
  key: Key;
  label: string;
  badge?: number;
}

const ICONS: Record<Key, React.ReactNode> = {
  profile: <AccountCircleIcon fontSize="small" />,
  dashboard: <DashboardCustomizeIcon fontSize="small" />,
  accounts: <CreditCardIcon fontSize="small" />,
  payments: <ReceiptLongIcon fontSize="small" />,
  subscriptions: <SubscriptionsIcon fontSize="small" />,
  support: <SupportAgentIcon fontSize="small" />,
  settings: <SettingsIcon fontSize="small" />,
};

export interface ProfileSidebarProps {
  items?: SidebarItem[];
  active?: Key;
  onNavigate?: (key: Key) => void;
  counts?: { supportTickets?: number };
  embedded?: boolean; // when true, render flat (no separate paper)
  sx?: SxProps<Theme>;
}

export default function ProfileSidebar({
  items = [
    { key: "profile", label: "Profile" },
    { key: "payments", label: "Payments" },
    { key: "subscriptions", label: "Subscriptions" },
    { key: "support", label: "Support Tickets" },
    { key: "settings", label: "Settings" },
  ],
  active = "profile",
  onNavigate,
  counts,
  embedded,
  sx,
}: ProfileSidebarProps) {
  return (
    <Box
      sx={{
        ...(embedded
          ? {
              bgcolor: "transparent",
              p: 1,
            }
          : {
              borderRadius: 3,
              p: 1,
            }),
        ...sx,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ opacity: 0.85, px: 1, pb: 0.75, display: "flex", alignItems: "center", gap: 1 }}
      >
        <DashboardCustomizeIcon fontSize="small" /> My dashboard
      </Typography>

      <List disablePadding>
        {items.map((item) => {
          const Icon = ICONS[item.key] ?? ICONS.dashboard;
          const selected = active === item.key;
          const badge =
            item.key === "support" && counts?.supportTickets ? counts.supportTickets : item.badge;

          return (
            <ListItemButton
              key={item.key}
              selected={selected}
              onClick={() => onNavigate?.(item.key)}
              sx={{
                mx: 0.5,
                my: 0.5,
                borderRadius: 2,
                "&.Mui-selected": {
                  bgcolor: "action.selected",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                {badge ? <Badge color="secondary" badgeContent={badge}>{Icon}</Badge> : Icon}
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
                primary={item.label}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
