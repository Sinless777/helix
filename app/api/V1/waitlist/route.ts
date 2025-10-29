// app/api/V1/waitlist/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function noCacheHeaders() {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  }
}

// If you don't need cross-origin, set ALLOW_CORS=false (or just inline return {}).
const ALLOW_CORS = false

function corsHeaders(req: NextRequest) {
  if (!ALLOW_CORS) return {}
  const origin = req.headers.get('origin') ?? ''
  const allowed = new Set([
    'http://localhost:3000',
    'https://helixaibot.com',
  ])
  return allowed.has(origin)
    ? {
        'Access-Control-Allow-Origin': origin,
        'Vary': 'Origin',
        'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    : {}
}

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email)
}

type WaitlistBody = { email?: unknown }

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: { ...noCacheHeaders(), ...corsHeaders(req) },
  })
}

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { status: 'ok', message: 'waitlist endpoint ready' },
    { status: 200, headers: { ...noCacheHeaders(), ...corsHeaders(req) } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const raw = (await req.json().catch(() => ({}))) as WaitlistBody
    const email =
      typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : ''

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid or missing email' },
        { status: 400, headers: { ...noCacheHeaders(), ...corsHeaders(req) } }
      )
    }

    const { userId } = await auth().catch(() => ({ userId: null }))


    const now = new Date()
    const date = now.toISOString().slice(0, 10)
    const time = now.toISOString().slice(11, 19)

    const convexUrl =
      process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL
    if (!convexUrl) {
      return NextResponse.json(
        {
          status: 'error',
          message:
            'Convex URL not configured. Set NEXT_PUBLIC_CONVEX_URL or CONVEX_URL.',
        },
        { status: 500, headers: { ...noCacheHeaders(), ...corsHeaders(req) } }
      )
    }

    const client = new ConvexHttpClient(convexUrl)
    const id = await client.mutation(api.waitlist.add, {
      email,
      date,
      time,
      ...(userId ? { userId } : {}),
    })

    return NextResponse.json(
      {
        status: 'success',
        message: 'Added to waitlist',
        data: { id, email, date, time, userId: userId ?? null },
      },
      { status: 200, headers: { ...noCacheHeaders(), ...corsHeaders(req) } }
    )
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : typeof err === 'string' ? err : 'Server error'
    return NextResponse.json(
      { status: 'error', message },
      { status: 500, headers: { ...noCacheHeaders(), ...corsHeaders(req) } }
    )
  }
}
