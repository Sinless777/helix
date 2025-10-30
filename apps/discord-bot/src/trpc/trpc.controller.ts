// apps/discord-bot/src/trpc/trpc.controller.ts
// Forwards any /trpc/* request to the tRPC HTTP handler.

import { All, Controller, Req, Res } from '@nestjs/common'
import type { Request, Response } from 'express'
import { TrpcService } from './trpc.service'

@Controller('trpc')
export class TrpcController {
  constructor(private readonly trpcService: TrpcService) {}

  @All('*')
  async handle(@Req() req: Request, @Res() res: Response) {
    return this.trpcService.handle(req, res)
  }
}
