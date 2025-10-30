// apps/discord-bot/src/main.ts
// Bootstrap the NestJS Discord bot backend. Exposes GraphQL for public
// consumers and mounts the tRPC router for trusted internal calls.

import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  })

  app.setGlobalPrefix('api')

  const port = Number(process.env.PORT ?? 4000)
  await app.listen(port)
  // eslint-disable-next-line no-console -- server bootstrap log
  console.log(`Discord bot backend listening on port ${port}`)
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console -- surface bootstrap failures in dev logs
  console.error('Failed to start Discord bot backend', error)
  process.exit(1)
})
