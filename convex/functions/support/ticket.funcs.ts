// convex/functions/support/ticket.funcs.ts
// Shared ticket logic used by queries and mutations. Includes GitHub escalation
// helper that can be invoked when tickets transition into the ESCALATED state.

import type { MutationCtx, QueryCtx } from '../../_generated/server'
import type { Id } from '../../_generated/dataModel'
import { ticketStatuses, type TicketStatus } from '../../../content/constants/tickets'

type TicketDoc = {
  _id: Id<'tickets'>
  _creationTime: number
  id: string
  userId: string
  title: string
  description: string
  status: TicketStatus
  assigneeId?: string
  createdAt: number
  updatedAt: number
}

const STATUS_SET = new Set(ticketStatuses)
const GITHUB_REPO = 'https://github.com/Sinless777/helix'

export function assertStatus(status: string): asserts status is TicketStatus {
  if (!STATUS_SET.has(status as TicketStatus)) {
    throw new Error(`Invalid ticket status: ${status}`)
  }
}

async function requireAuth(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error('Authentication required')
  return identity
}

export async function listTickets(ctx: QueryCtx, filters?: { status?: TicketStatus; userId?: string }) {
  const db = (ctx as any).db
  let query = db.query('tickets')
  if (filters?.status) {
    query = query.withIndex('by_status', (q: any) => q.eq('status', filters.status))
  } else if (filters?.userId) {
    query = query.withIndex('by_userId', (q: any) => q.eq('userId', filters.userId))
  }
  const docs = await query.collect()
  return docs as TicketDoc[]
}

export async function getTicketById(ctx: QueryCtx, ticketId: string) {
  const db = (ctx as any).db
  const doc = await db
    .query('tickets')
    .withIndex('by_id', (q: any) => q.eq('id', ticketId))
    .unique()
  return (doc as TicketDoc | null) ?? null
}

async function maybeEscalateToGithub(ticket: TicketDoc) {
  if (ticket.status !== 'ESCALATED') return
  const token = process.env.GITHUB_ACCESS_TOKEN
  if (!token) {
    console.warn('[tickets] GITHUB_ACCESS_TOKEN not configured; skipping GitHub escalation')
    return
  }

  const issueTitle = `[Ticket Escalation] ${ticket.title}`
  const issueBody = [
    `**Ticket ID:** ${ticket.id}`,
    `**User ID:** ${ticket.userId}`,
    `**Status:** ${ticket.status}`,
    '',
    ticket.description,
  ].join('\n')

  const url = new URL('/repos/Sinless777/helix/issues', 'https://api.github.com')

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: issueTitle, body: issueBody }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error(`[tickets] Failed to create GitHub issue: ${response.status} ${text}`)
    }
  } catch (error) {
    console.error('[tickets] Error creating GitHub issue', error)
  }
}

export async function createTicket(
  ctx: MutationCtx,
  args: { title: string; description: string }
) {
  const identity = await requireAuth(ctx)
  const db = (ctx as any).db

  const now = Date.now()
  const documentId = await db.generateId('tickets')

  const insertId = await db.insert('tickets', {
    id: documentId,
    userId: identity.subject,
    title: args.title.trim(),
    description: args.description.trim(),
    status: 'OPEN' as TicketStatus,
    createdAt: now,
    updatedAt: now,
  })

  return (await db.get(insertId)) as TicketDoc
}

export async function updateTicket(
  ctx: MutationCtx,
  args: {
    ticketId: string
    status?: TicketStatus
    title?: string
    description?: string
    assigneeId?: string | null
  },
) {
  const identity = await requireAuth(ctx)
  const db = (ctx as any).db

  const ticket = await getTicketById(ctx, args.ticketId)
  if (!ticket) {
    throw new Error('Ticket not found')
  }

  // TODO: role-based authorization can be layered here by reading role documents.
  if (ticket.userId !== identity.subject) {
    throw new Error('Insufficient permissions to update ticket')
  }

  const patch: Partial<TicketDoc> = {}
  if (args.title !== undefined) patch.title = args.title.trim()
  if (args.description !== undefined) patch.description = args.description.trim()
  if (args.status !== undefined) {
    assertStatus(args.status)
    patch.status = args.status
  }
  if (args.assigneeId !== undefined) {
    if (args.assigneeId === null) {
      delete (patch as any).assigneeId
    } else {
      patch.assigneeId = args.assigneeId
    }
  }
  patch.updatedAt = Date.now()

  await db.patch(ticket._id, patch)
  const updated = (await db.get(ticket._id)) as TicketDoc

  if (patch.status === 'ESCALATED') {
    await maybeEscalateToGithub(updated)
  }

  return updated
}
