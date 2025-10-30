'use client';

// components/users/Profile/ProfileAccountsCard.tsx
// Renders the list of linked accounts so members can jump to their account
// management surface. The title intentionally uses the Pinyon Script font to
// match the requested aesthetic.

import * as React from 'react';
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import type { LinkedAccount } from '@/lib/users/accounts';
import GlassCard from '@/components/ui/GlassCard';

export interface ProfileAccountsCardProps {
  userId: string;
  accounts: LinkedAccount[];
  canManage: boolean;
  fallbackManageHref?: string;
}

function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ProfileAccountsCard({
  userId,
  accounts,
  canManage,
  fallbackManageHref,
}: ProfileAccountsCardProps) {
  const hasAccounts = accounts.length > 0;
  const manageBaseHref = fallbackManageHref ?? `/${encodeURIComponent(userId)}/settings/accounts`;

  return (
    <GlassCard component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'var(--font-pinyon)',
              fontSize: '2rem',
              lineHeight: 1.2,
            }}
          >
            Accounts
          </Typography>
          <Typography variant="body2" color="text.secondary">
              Manage the services connected to your Helix profile.
          </Typography>
        </Box>

        {hasAccounts ? (
          <Stack spacing={1.5}>
            {accounts.map((account) => {
              const manageUrl =
                account.managementUrl ?? `${manageBaseHref}?provider=${encodeURIComponent(account.provider)}`;
              return (
                <Box
                  key={`${account.provider}-${account.accountId}`}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight={600}>
                      {account.displayName}
                    </Typography>
                    <Chip
                      size="small"
                      label={account.provider}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Linked on {formatTimestamp(account.connectedAt)}
                  </Typography>
                  {account.status ? (
                    <Typography variant="caption" color="text.secondary">
                      Status: {account.status}
                    </Typography>
                  ) : null}
                  <Button
                    component={Link}
                    href={manageUrl}
                    variant="outlined"
                    size="small"
                    sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                  >
                    Manage account
                  </Button>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'action.hover',
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              You have not linked any accounts yet.
            </Typography>
            {canManage ? (
              <Button
                component={Link}
                href={`${manageBaseHref}?user=${encodeURIComponent(userId)}`}
                variant="contained"
                size="small"
                sx={{ mt: 1 }}
              >
                Link an account
              </Button>
            ) : null}
          </Box>
        )}
        {canManage ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
            <Button
              component={Link}
              href={`${manageBaseHref}?user=${encodeURIComponent(userId)}`}
              variant="text"
              size="small"
            >
              Open account settings
            </Button>
          </Box>
        ) : null}
    </GlassCard>
  );
}

export default ProfileAccountsCard;
