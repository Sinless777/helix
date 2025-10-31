'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import SupportTicketForm from '@/components/support/SupportTicketForm';
import SupportTicketList from '@/components/support/SupportTicketList';
import type { SupportTicket } from '@/types/support';

export interface SupportTicketsPanelProps {
  /** Ignored: anyone can create a ticket now. Kept for backward-compat. */
  canCreate: boolean;
  canModerate: boolean;
  /**
   * If provided, clicking a ticket row navigates to `${detailRouteBase}/${ticket.id}`.
   * Example: "/dashboard/support/tickets"
   */
  detailRouteBase?: string;
  /** Auto-refresh interval in ms (default 30000). Set 0 to disable. */
  refreshMs?: number;
}

export default function SupportTicketsPanel({
  canCreate: _deprecatedCanCreate,
  canModerate,
  detailRouteBase,
  refreshMs = 30000,
}: SupportTicketsPanelProps) {
  const router = useRouter();

  // New behavior: anyone can create a ticket
  const allowCreate = true;

  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [snack, setSnack] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<number | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [newTicketOpen, setNewTicketOpen] = React.useState(false);

  const controllerRef = React.useRef<AbortController | null>(null);

  const loadTickets = React.useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/V1/support/ticket', {
        cache: 'no-store',
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? 'Unable to load tickets.');
      }

      const payload = (await response.json()) as { tickets: SupportTicket[] };
      setTickets(payload.tickets ?? []);
      setLastUpdated(Date.now());
    } catch (err) {
      if ((err as any)?.name === 'AbortError') return;
      const message = err instanceof Error ? err.message : 'Unable to load tickets.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  React.useEffect(() => {
    void loadTickets();
    return () => controllerRef.current?.abort();
  }, [loadTickets]);

  // Auto refresh while tab is visible
  React.useEffect(() => {
    if (!refreshMs || refreshMs <= 0) return;

    let interval: NodeJS.Timeout | null = null;

    const start = () => {
      if (!interval) {
        interval = setInterval(() => {
          if (document.visibilityState === 'visible') {
            void loadTickets();
          }
        }, refreshMs);
      }
    };

    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const onVis = () => {
      if (document.visibilityState === 'visible') start();
      else stop();
    };

    start();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [loadTickets, refreshMs]);

  // Helper to safely push a string route (avoids typed RouteImpl constraint)
  const go = React.useCallback(
    (href: string) => {
      (router as any).push(href);
    },
    [router],
  );

  // Optional row open -> navigate
  const handleOpenTicket = React.useCallback(
    (t: SupportTicket) => {
      if (!detailRouteBase) return;
      const href = `${detailRouteBase}/${encodeURIComponent(t.id)}`;
      go(href);
    },
    [detailRouteBase, go],
  );

  // Optimistic status updates
  const handleUpdateStatus = React.useCallback(
    async (ticket: SupportTicket, nextStatus: SupportTicket['status']) => {
      if (!canModerate || updatingId) return;

      const prev = tickets;
      const next = tickets.map((t) =>
        t.id === ticket.id ? { ...t, status: nextStatus, updatedAt: Date.now() } : t,
      );

      setUpdatingId(ticket.id);
      setTickets(next);

      try {
        const res = await fetch(`/api/V1/support/ticket/${encodeURIComponent(ticket.id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        });

        if (!res.ok) {
          const payload = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error ?? 'Failed to update ticket.');
        }

        setSnack(`Ticket ${ticket.id} updated to ${nextStatus.replace('_', ' ')}`);
        setLastUpdated(Date.now());
      } catch (err) {
        // rollback
        setTickets(prev);
        const message =
          err instanceof Error ? err.message : 'Unable to update ticket right now.';
        setError(message);
      } finally {
        setUpdatingId(null);
      }
    },
    [canModerate, tickets, updatingId],
  );

  // Build props for SupportTicketList while respecting exactOptionalPropertyTypes
  const listProps: React.ComponentProps<typeof SupportTicketList> = {
    tickets,
    canModerate,
    enableLocalFilters: true,
  };
  if (detailRouteBase) {
    listProps.onOpen = handleOpenTicket; // only add when defined
  }
  if (canModerate) {
    listProps.onUpdateStatus = handleUpdateStatus; // only add when defined
  }

  return (
    <Stack spacing={3} sx={{ pt: 2, pb: 4 }}>
      {/* Header row with perfectly-centered title */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        spacing={1}
        sx={{ width: '100%' }}
      >
        {/* Left spacer to balance actions on the right (for perfect centering) */}
        <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />

        {/* Centered title & subtitle */}
        <Stack spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
          <Typography
            variant="h3"
            fontFamily="var(--font-pinyon)"
            fontWeight={700}
            sx={{
              fontSize: { xs: '2rem', sm: '3.5rem', md: '4rem' },
              letterSpacing: '0.5px',
              color: 'text.primary',
              textAlign: 'center',
            }}
          >
            Support tickets
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}
          >
            Submit a support request and our team will follow up as soon as possible.
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: 'center', fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' } }}
          >
            {lastUpdated
              ? `Last updated ${new Date(lastUpdated).toLocaleTimeString()}`
              : 'Not updated yet'}
          </Typography>
        </Stack>

        {/* Actions on the right */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ flex: 1, justifyContent: 'flex-end', width: '100%' }}
        >
          {allowCreate && (
            <Button
              variant="contained"
              size="small"
              onClick={() => setNewTicketOpen(true)}
              disabled={loading}
            >
              New Ticket
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={() => void loadTickets()}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* New Ticket Dialog */}
      <Dialog
        open={newTicketOpen}
        onClose={() => setNewTicketOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontFamily: 'var(--font-pinyon)', fontSize: 28 }}>
          Create a new ticket
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <SupportTicketForm
            onCreated={async () => {
              setNewTicketOpen(false);
              await loadTickets();
              setSnack('Ticket created successfully.');
            }}
            disabled={!!updatingId}
          />
        </DialogContent>
      </Dialog>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void loadTickets()}>
              Retry
            </Button>
          }
          sx={{ mx: 'auto', maxWidth: 600 }}
        >
          {error}
        </Alert>
      ) : (
        <SupportTicketList {...listProps} />
      )}

      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        message={snack ?? ''}
      />
    </Stack>
  );
}
