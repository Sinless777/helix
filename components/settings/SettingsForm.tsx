'use client';

// components/settings/SettingsForm.tsx
// Client-side form for updating encrypted user settings. Handles encryption via
// the shared AES helpers before calling the Convex mutation.

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation } from 'convex/react';
import { encryptJson } from '@/lib/security/encrypt.util';
import type { UserSettingsContent } from '@/lib/users/settings';
import { api } from '@/convex/_generated/api';

export interface SettingsFormProps {
  userId: string;
  initialSettings: UserSettingsContent;
  version: number;
}

const THEMES: Array<UserSettingsContent['theme']> = ['system', 'light', 'dark'];

export default function SettingsForm({ userId, initialSettings, version }: SettingsFormProps) {
  const SETTINGS_ENCRYPTION_KEY =
    process.env.NEXT_PUBLIC_SETTINGS_ENCRYPTION_KEY ??
    process.env.NEXT_PUBLIC_PROFILE_ENCRYPTION_KEY;
  const [settings, setSettings] = React.useState<UserSettingsContent>(initialSettings);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const saveSettingsMutation = useMutation(api.settings.save);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    if (!SETTINGS_ENCRYPTION_KEY) {
      setError('Settings encryption key is not configured');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const trimmedUrl = settings.accountManagementUrl?.trim() ?? '';
      const payload: UserSettingsContent = {
        theme: settings.theme,
        timezone: settings.timezone.trim() || 'UTC',
        notificationsEnabled: settings.notificationsEnabled,
        accountManagementUrl: trimmedUrl.length > 0 ? trimmedUrl : null,
      };

      const { ciphertext, iv } = await encryptJson(payload, SETTINGS_ENCRYPTION_KEY);

      await saveSettingsMutation({
        userId,
        encryptedSettings: ciphertext,
        iv,
        version,
      });

      setSuccess('Settings updated successfully.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update settings right now.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card component="form" onSubmit={handleSubmit} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Profile settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Control the basics of your Helix experience.
          </Typography>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}

        <FormControl component="fieldset">
          <FormLabel component="legend">Theme preference</FormLabel>
          <Select
            value={settings.theme}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, theme: event.target.value as UserSettingsContent['theme'] }))
            }
            size="small"
            sx={{ mt: 1, width: '100%', maxWidth: 240 }}
          >
            {THEMES.map((theme) => (
              <MenuItem key={theme} value={theme} sx={{ textTransform: 'capitalize' }}>
                {theme}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={settings.notificationsEnabled}
              onChange={(event) =>
                setSettings((prev) => ({ ...prev, notificationsEnabled: event.target.checked }))
              }
            />
          }
          label="Email me important notifications"
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Timezone"
            value={settings.timezone}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, timezone: event.target.value }))
            }
            helperText="Format example: America/Los_Angeles"
            fullWidth
          />
          <TextField
            label="Account management URL"
            value={settings.accountManagementUrl ?? ''}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                accountManagementUrl: event.target.value.length > 0 ? event.target.value : null,
              }))
            }
            helperText="Optional link to an external account portal"
            fullWidth
          />
        </Stack>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', px: 3, pb: 3 }}>
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save settings'}
        </Button>
      </CardActions>
    </Card>
  );
}
