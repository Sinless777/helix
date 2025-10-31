'use client';

import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';
import * as React from 'react';

export interface SupportTicketFormProps {
  onCreated?: () => void;
  disabled?: boolean;
}

type TicketCategory = 'BUG' | 'FEATURE_REQUEST' | 'OTHER';
const CATEGORY_OPTIONS: TicketCategory[] = ['BUG', 'FEATURE_REQUEST', 'OTHER'];

export default function SupportTicketForm({ onCreated, disabled }: SupportTicketFormProps) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState<TicketCategory>('OTHER');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const reset = React.useCallback(() => {
    setTitle('');
    setDescription('');
    setCategory('OTHER');
  }, []);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (disabled || submitting) return;

      const cleanTitle = title.trim();
      const cleanDescription = description.trim();
      if (!cleanTitle || !cleanDescription) {
        setError('Both title and description are required.');
        return;
      }

      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await fetch('/api/V1/support/ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: cleanTitle,
            description: cleanDescription,
            category, // <-- send category
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error ?? 'Failed to create ticket.');
        }

        reset();
        setSuccess('Ticket submitted successfully.');
        onCreated?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to submit ticket right now.';
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
    [description, disabled, onCreated, reset, submitting, title, category]
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <Stack spacing={2}>
        <TextField
          label="Subject"
          placeholder="Brief summary of your issue"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={disabled || submitting}
          required
        />

        <FormControl size="small" disabled={disabled || submitting}>
          <InputLabel id="ticket-category-label">Category</InputLabel>
          <Select
            labelId="ticket-category-label"
            value={category}
            label="Category"
            onChange={(e: SelectChangeEvent) => setCategory(e.target.value as TicketCategory)}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <MenuItem key={c} value={c}>
                {c === 'BUG' ? 'Bug' : c === 'FEATURE_REQUEST' ? 'Feature request' : 'Other'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Description"
          placeholder="Describe what happened, steps to reproduce, and any relevant context."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={disabled || submitting}
          multiline
          minRows={4}
          required
        />
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <Button type="submit" variant="contained" disabled={disabled || submitting}>
          {submitting ? 'Submitting…' : 'Submit ticket'}
        </Button>
        <Typography variant="caption" color="text.secondary">
          Please include repro steps where possible.
        </Typography>
      </Stack>
    </Box>
  );
}
