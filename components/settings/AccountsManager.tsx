'use client';

// components/settings/AccountsManager.tsx
// Allows a signed-in user to link or unlink accounts that are stored in the
// Convex `accounts` table. The UI stays intentionally lightweight so provider
// specific flows can be layered on later.

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMutation } from 'convex/react';
import * as React from 'react';

import { api } from '@/convex/_generated/api';
import type { LinkedAccount } from '@/lib/users/accounts';

export interface AccountsManagerProps {
  userId: string;
  initialAccounts: LinkedAccount[];
}

type AccountDraft = {
  provider: string;
  accountId: string;
  displayName: string;
  managementUrl?: string;
  status?: string;
};

type LinkArgs = {
  userId: string;
  provider: string;
  accountId: string;
  displayName: string;
  managementUrl?: string;
  status?: string;
};

const EMPTY_DRAFT: AccountDraft = {
  provider: '',
  accountId: '',
  displayName: '',
  managementUrl: '',
  status: '',
};

export default function AccountsManager({ userId, initialAccounts }: AccountsManagerProps) {
  const [accounts, setAccounts] = React.useState(initialAccounts);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<AccountDraft>(EMPTY_DRAFT);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const linkMutation = useMutation(api.accounts.link);
  const unlinkMutation = useMutation(api.accounts.unlink);

  const handleOpenDialog = () => {
    setDraft(EMPTY_DRAFT);
    setError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (busy) return;
    setDialogOpen(false);
  };

  const handleFieldChange =
    (key: keyof AccountDraft) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setDraft((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    if (!draft.provider.trim() || !draft.accountId.trim() || !draft.displayName.trim()) {
      setError('Provider, Account ID, and Display name are required.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const payload: LinkArgs = {
        userId,
        provider: draft.provider.trim(),
        accountId: draft.accountId.trim(),
        displayName: draft.displayName.trim(),
      };

      const trimmedUrl = draft.managementUrl?.trim();
      if (trimmedUrl) payload.managementUrl = trimmedUrl;

      const trimmedStatus = draft.status?.trim();
      if (trimmedStatus) payload.status = trimmedStatus;

      const result = await linkMutation(payload);
      const now = Date.now();

      setAccounts((prev) => {
        const previous = prev.find(
          (existing) =>
            existing.provider === payload.provider && existing.accountId === payload.accountId
        );

        const next: LinkedAccount = {
          _id: result._id,
          _creationTime: previous?._creationTime ?? now,
          userId,
          provider: payload.provider,
          accountId: payload.accountId,
          displayName: payload.displayName,
          managementUrl: payload.managementUrl ?? null,
          status: payload.status ?? null,
          connectedAt: previous?.connectedAt ?? now,
          updatedAt: now,
        };

        const filtered = prev.filter(
          (existing) =>
            !(existing.provider === payload.provider && existing.accountId === payload.accountId)
        );
        return [...filtered, next];
      });
      setDialogOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to link account.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleUnlink = async (account: LinkedAccount) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await unlinkMutation({
        userId,
        provider: account.provider,
        accountId: account.accountId,
      });
      setAccounts((prev) =>
        prev.filter(
          (existing) =>
            !(existing.provider === account.provider && existing.accountId === account.accountId)
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to unlink account.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Linked accounts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connect external services so Helix can access them securely.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Link account
          </Button>
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Stack spacing={1.5}>
          {accounts.length > 0 ? (
            accounts.map((account) => (
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
                  <Tooltip title="Unlink">
                    <IconButton size="small" onClick={() => handleUnlink(account)} disabled={busy}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Provider: {account.provider}
                </Typography>
                {account.managementUrl ? (
                  <Typography variant="caption" color="text.secondary">
                    Portal: {account.managementUrl}
                  </Typography>
                ) : null}
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              You have not linked any accounts yet.
            </Typography>
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 3, pb: 3, justifyContent: 'flex-end' }}>
        <Button variant="outlined" disabled>
          Accounts sync automatically
        </Button>
      </CardActions>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Link account</DialogTitle>
        <DialogContent>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          <Stack component="form" id="account-link-form" onSubmit={handleSubmit} spacing={2}>
            <TextField
              label="Provider"
              value={draft.provider}
              onChange={handleFieldChange('provider')}
              required
              autoFocus
            />
            <TextField
              label="Account ID"
              value={draft.accountId}
              onChange={handleFieldChange('accountId')}
              required
            />
            <TextField
              label="Display name"
              value={draft.displayName}
              onChange={handleFieldChange('displayName')}
              required
            />
            <TextField
              label="Management URL"
              value={draft.managementUrl}
              onChange={handleFieldChange('managementUrl')}
            />
            <TextField label="Status" value={draft.status} onChange={handleFieldChange('status')} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="account-link-form" variant="contained" disabled={busy}>
            {busy ? 'Saving…' : 'Link account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
