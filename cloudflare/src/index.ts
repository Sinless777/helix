// cloudflare/src/index.ts
// Cloudflare Worker entry point that exposes a public fetch handler and
// consumes messages from the helix-events queue.

export interface Env {
  DISCORD_BOT_URL: string;
  HELIX_EVENTS: QueueMessage<HelixEvent>;
}

type HelixEvent = {
  type: string;
  payload: Record<string, unknown>;
};

type QueueMessage<T> = {
  acknowledge: () => Promise<void>;
  retry: (options?: { delaySeconds?: number }) => Promise<void>;
  body: T;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname === '/health') {
      return new Response('ok', { status: 200 });
    }

    const upstream = env.DISCORD_BOT_URL?.replace(/\/$/, '') ?? '';
    if (!upstream) {
      return new Response('DISCORD_BOT_URL missing', { status: 500 });
    }

    const response = await fetch(`${upstream}/api/health`, { method: 'GET' }).catch(() => null);
    if (!response) {
      return new Response('Upstream unavailable', { status: 503 });
    }

    return new Response(response.body, { status: response.status, headers: response.headers });
  },

  async queue(batch: MessageBatch<HelixEvent>, env: Env) {
    for (const message of batch.messages) {
      // Placeholder: forward event to the Discord bot backend when implemented.
      console.log('Received queue event', message.body);
      await message.ack();
    }
  },
};

type MessageBatch<T> = {
  messages: Array<{
    body: T;
    ack: () => Promise<void>;
    retry: (options?: { delaySeconds?: number }) => Promise<void>;
  }>;
};
