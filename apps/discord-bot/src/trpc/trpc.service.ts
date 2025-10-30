// apps/discord-bot/src/trpc/trpc.service.ts
// Wraps the tRPC router in an adapter that NestJS can expose via Express.

import { Injectable } from '@nestjs/common'
import type { Request, Response } from 'express'
import { createHTTPHandler } from '@trpc/server/adapters/express'
import { trpcRouter, type TrpcRouter } from './trpc.router'

@Injectable()
export class TrpcService {
  private readonly handler: ReturnType<typeof createHTTPHandler<TrpcRouter>>

  constructor() {
    this.handler = createHTTPHandler({
      router: trpcRouter,
      createContext: ({ req }) => ({
        userId: req.header('x-user-id') ?? undefined,
      }),
    })
  }

  handle(req: Request, res: Response) {
    return this.handler(req, res)
  }
}
