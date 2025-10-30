// apps/discord-bot/src/trpc/trpc.module.ts
// Binds the tRPC service and controller into the Nest application graph.

import { Module } from '@nestjs/common'
import { TrpcController } from './trpc.controller'
import { TrpcService } from './trpc.service'

@Module({
  controllers: [TrpcController],
  providers: [TrpcService],
  exports: [TrpcService],
})
export class TrpcModule {}
