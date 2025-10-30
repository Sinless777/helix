// apps/discord-bot/src/app.resolver.ts
// GraphQL resolver exposing a basic hello query and health check field.

import { Query, Resolver } from '@nestjs/graphql'
import { AppService } from './app.service'

@Resolver()
export class AppResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => String, { description: 'Returns a friendly welcome message.' })
  hello(): string {
    return this.appService.getWelcomeMessage()
  }

  @Query(() => Boolean, { description: 'Lightweight health check for uptime probes.' })
  health(): boolean {
    return true
  }
}
