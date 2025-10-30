// cloudflare/container.ts
// Cloudflare Containers configuration for running Grafana Alloy alongside the
// Worker using the provided helper snippet.

import { Container, getContainer } from '@cloudflare/containers'

export class MyContainer extends Container {
  defaultPort = 4000
  sleepAfter = '10m'
}

export default {
  async fetch(request: Request, env: { MY_CONTAINER: string }) {
    const { 'session-id': sessionId } = await request.json()
    const containerInstance = getContainer(env.MY_CONTAINER, sessionId)
    return containerInstance.fetch(request)
  },
}
