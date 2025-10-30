// components/users/Profile/wrapper.tsx
"use client";

import * as React from "react";
import { alpha, useTheme } from "@mui/material/styles";
import { Box, Divider } from "@mui/material";
import { Grid } from "@mui/material";
import ProfileSidebar from "./sidebar";
import ProfileTopbar from "./topbar";

export interface ProfileLayoutProps {
  user: {
    name: string;
    avatarUrl?: string;
  };
  userId?: string;
  children: React.ReactNode;
}

export function ProfileLayout({ user, userId, children }: ProfileLayoutProps) {
  const theme = useTheme();

  const glass = {
    bgcolor: alpha(
      theme.palette.background.paper,
      theme.palette.mode === "dark" ? 0.35 : 0.55
    ),
    backdropFilter: "blur(10px) saturate(120%)",
    WebkitBackdropFilter: "blur(10px) saturate(120%)",
    border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 8px 24px rgba(0,0,0,.35)"
        : "0 8px 24px rgba(0,0,0,.12)",
  } as const;

  const stickyTop = 16;

  return (
    <Box
      sx={{
        bgcolor: "transparent",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Grid container sx={{ flex: 1, minHeight: 0, p: { xs: 2, md: 3 } }} spacing={2}>
        {/* LEFT RAIL — full-height, sticky, NO internal scroll */}
        <Grid
          size={{ xs: 12, md: 3 }}
          sx={{
            position: { md: "sticky" },
            top: { md: stickyTop },
            height: { md: `calc(90vh - ${stickyTop + 24}px)` },
            alignSelf: "flex-start",
          }}
        >
          <Box
            sx={{
              ...glass,
              borderRadius: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {userId ? (
              <ProfileTopbar user={user} userId={userId} embedded sx={{ px: 2, py: 1.25 }} />
            ) : (
              <ProfileTopbar user={user} embedded sx={{ px: 2, py: 1.25 }} />
            )}

            <Divider sx={{ opacity: 0.3 }} />

            {/* Sidebar fills remaining space, still no scroll */}
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <ProfileSidebar
                embedded
                active="profile"
                onNavigate={(key) => console.log("navigate", key)}
                counts={{ supportTickets: 2 }}
                sx={{ px: 1, py: 1 }}
                items={[
                  { key: "profile", label: "Profile" },
                  { key: "accounts", label: "Accounts" },
                  { key: "payments", label: "Payments" },
                  { key: "subscriptions", label: "Subscriptions" },
                  { key: "support", label: "Support Tickets", badge: 2 },
                  { key: "settings", label: "Settings" },
                ]}
              />
            </Box>
          </Box>
        </Grid>

        {/* MAIN CONTENT — transparent so the background image shows */}
        <Grid
          size={{ xs: 12, md: 9 }}
          sx={{
            bgcolor: "transparent",
            p: { xs: 0.5, md: 1 },
          }}
        >
          {children}
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProfileLayout;
