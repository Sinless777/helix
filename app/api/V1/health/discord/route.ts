// app/api/internal/discord/health/route.ts
// Proxies a health check through the NestJS Discord bot tRPC endpoint.

import { NextResponse } from 'next/server'
import { discordTrpc } from '@/lib/api/discordBot'

export async function GET() {
  const health = await discordTrpc<'health', { ok: boolean }>('health').catch(() => ({ ok: false }))
  return NextResponse.json(health)
}
