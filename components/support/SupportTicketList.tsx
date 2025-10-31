'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';
import GlassCard from '@/components/ui/GlassCard';
import type { SupportTicket } from '@/types/support';

export interface SupportTicketListProps {
  tickets: SupportTicket[];
  canModerate?: boolean;

  /** If provided, a ticket row becomes interactive and calls this when opened (click/Enter/Space). */
  onOpen?: (ticket: SupportTicket) => void;

  /** If provided and user canModerate, action buttons will call this with new status. */
  onUpdateStatus?: (ticket: SupportTicket, nextStatus: SupportTicket['status']) => void;

  /** Show local filters/search header (client-side only). Default: true */
  enableLocalFilters?: boolean;
}

type TicketStatus = SupportTicket['status'];
type TicketCategory = SupportTicket extends { category: infer C }
  ? C
  : 'BUG' | 'FEATURE_REQUEST' | 'OTHER';

const STATUS_OPTIONS: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED'];
const CATEGORY_OPTIONS: TicketCategory[] = ['BUG', 'FEATURE_REQUEST', 'OTHER'] as TicketCategory[];

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString();
}

function statusColor(status: TicketStatus) {
  switch (status) {
    case 'OPEN':
      return 'primary';
    case 'IN_PROGRESS':
    case 'ESCALATED':
      return 'warning';
    case 'RESOLVED':
      return 'success';
    case 'CLOSED':
    default:
      return 'default';
  }
}

function categoryColor(category: TicketCategory) {
  switch (category) {
    case 'BUG':
      return 'error';
    case 'FEATURE_REQUEST':
      return 'info';
    default:
      return 'default';
  }
}

export default function SupportTicketList({
  tickets,
  canModerate,
  onOpen,
  onUpdateStatus,
  enableLocalFilters = true,
}: SupportTicketListProps) {
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | TicketStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = React.useState<'ALL' | TicketCategory>('ALL');
  const [sortKey, setSortKey] = React.useState<'updated' | 'created'>('updated');
  const [q, setQ] = React.useState('');

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return tickets
      .filter((t) => (statusFilter === 'ALL' ? true : t.status === statusFilter))
      .filter((t) => (categoryFilter === 'ALL' ? true : (t as any).category === categoryFilter))
      .filter((t) =>
        needle
          ? (t.title?.toLowerCase() ?? '').includes(needle) ||
            (t.description?.toLowerCase() ?? '').includes(needle) ||
            (t.userId ?? '').toLowerCase().includes(needle)
          : true
      )
      .sort((a, b) =>
        sortKey === 'updated' ? b.updatedAt - a.updatedAt : b.createdAt - a.createdAt
      );
  }, [tickets, statusFilter, categoryFilter, q, sortKey]);

  const handleRowActivate = (ticket: SupportTicket) => {
    onOpen?.(ticket);
  };

  const handleKeyDownCard = (e: React.KeyboardEvent, ticket: SupportTicket) => {
    if (!onOpen) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowActivate(ticket);
    }
  };

  if (tickets.length === 0) {
    return (
      <GlassCard component="section">
        <Typography variant="body2" color="text.secondary">
          No support tickets found.
        </Typography>
      </GlassCard>
    );
  }

  return (
    <Stack spacing={2}>
      {enableLocalFilters && (
        <GlassCard component="section" sx={{ p: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <TextField
              label="Search"
              placeholder="Search title, description, or user id…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              size="small"
              fullWidth
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                label="Status"
                value={statusFilter}
                onChange={(e: SelectChangeEvent) =>
                  setStatusFilter(e.target.value as 'ALL' | TicketStatus)
                }
              >
                <MenuItem value="ALL">All</MenuItem>
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                label="Category"
                value={categoryFilter}
                onChange={(e: SelectChangeEvent) =>
                  setCategoryFilter(e.target.value as 'ALL' | TicketCategory)
                }
              >
                <MenuItem value="ALL">All</MenuItem>
                {CATEGORY_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c === 'BUG' ? 'Bug' : c === 'FEATURE_REQUEST' ? 'Feature request' : 'Other'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="sort-key-label">Sort by</InputLabel>
              <Select
                labelId="sort-key-label"
                label="Sort by"
                value={sortKey}
                onChange={(e: SelectChangeEvent) =>
                  setSortKey(e.target.value as 'updated' | 'created')
                }
              >
                <MenuItem value="updated">Updated (newest)</MenuItem>
                <MenuItem value="created">Created (newest)</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </GlassCard>
      )}

      {filtered.map((ticket) => {
        const interactive = Boolean(onOpen);
        return (
          <Box
            key={ticket.id}
            component="article"
            tabIndex={interactive ? 0 : -1}
            role={interactive ? 'button' : undefined}
            onClick={interactive ? () => handleRowActivate(ticket) : undefined}
            onKeyDown={(e: React.KeyboardEvent) => handleKeyDownCard(e, ticket)}
            sx={{
              outline: 'none',
              borderRadius: 2, // match GlassCard rounding so the focus ring looks right
              '&:focus-visible': {
                boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`,
              },
            }}
          >
            <GlassCard
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                <Typography variant="h6" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                  {ticket.title}
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                  {/* Category */}
                  {'category' in ticket && ticket.category ? (
                    <Chip
                      label={
                        ticket.category === 'BUG'
                          ? 'Bug'
                          : ticket.category === 'FEATURE_REQUEST'
                          ? 'Feature'
                          : 'Other'
                      }
                      color={categoryColor(ticket.category as TicketCategory)}
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  ) : null}

                  {/* Status */}
                  <Chip
                    label={ticket.status.replace('_', ' ')}
                    color={statusColor(ticket.status)}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Stack>
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {ticket.description}
              </Typography>

              <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Created {formatDate(ticket.createdAt)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Updated {formatDate(ticket.updatedAt)}
                </Typography>
                {'assigneeId' in ticket && ticket.assigneeId ? (
                  <Typography variant="caption" color="text.secondary">
                    Assignee: {ticket.assigneeId}
                  </Typography>
                ) : null}
                {canModerate ? (
                  <Typography variant="caption" color="text.secondary">
                    User: {ticket.userId}
                  </Typography>
                ) : null}
              </Stack>

              {canModerate && onUpdateStatus ? (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(ticket, 'RESOLVED');
                        }}
                      >
                        Mark Resolved
                      </Button>
                    )}
                    {ticket.status !== 'CLOSED' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(ticket, 'CLOSED');
                        }}
                      >
                        Close
                      </Button>
                    )}
                    {ticket.status !== 'ESCALATED' && (
                      <Button
                        size="small"
                        color="warning"
                        variant="text"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(ticket, 'ESCALATED');
                        }}
                      >
                        Escalate
                      </Button>
                    )}
                  </Stack>
                </>
              ) : null}
            </GlassCard>
          </Box>
        );
      })}
    </Stack>
  );
}
