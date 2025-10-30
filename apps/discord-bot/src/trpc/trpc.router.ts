// apps/discord-bot/src/trpc/trpc.router.ts
// tRPC router exposing internal procedures that Next.js can call without
// touching the public GraphQL API.

import { initTRPC } from '@trpc/server'

export type TrpcContext = {
  userId?: string
}

const t = initTRPC.context<TrpcContext>().create()

export const trpcRouter = t.router({
  health: t.procedure.query(() => ({ ok: true })),
  welcome: t.procedure.query(({ ctx }) => ({
    message: ctx.userId
      ? `Welcome back, ${ctx.userId}!`
      : 'Welcome internal Helix service.',
  })),
})

export type TrpcRouter = typeof trpcRouter
