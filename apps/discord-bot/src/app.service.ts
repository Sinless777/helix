// apps/discord-bot/src/app.service.ts
// Simple service backing both GraphQL and tRPC endpoints.

import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getWelcomeMessage(): string {
    return 'Helix Discord Bot backend is online.'
  }
}
