// lib/api/discordBot/index.ts
// Lightweight clients for communicating with the NestJS Discord bot backend.

const DEFAULT_BASE_URL = process.env.DISCORD_BOT_URL ?? 'http://localhost:4000';

function buildUrl(path: string) {
  const base = DEFAULT_BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}

export async function discordGraphql<T>(query: string, variables?: Record<string, unknown>) {
  const response = await fetch(buildUrl('/graphql'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { data?: T; errors?: unknown };
  if (payload.errors) {
    throw new Error('GraphQL responded with errors');
  }
  return payload.data as T;
}

export async function discordTrpc<Path extends string, Result = unknown>(
  path: Path,
  init?: {
    input?: unknown;
    userId?: string;
  }
): Promise<Result> {
  const url = new URL(buildUrl(`/trpc/${path}`));
  if (init?.input !== undefined) {
    url.searchParams.set('input', JSON.stringify(init.input));
  }

  const headers = init?.userId ? ({ 'x-user-id': init.userId } as HeadersInit) : undefined;

  const response = await fetch(url, headers ? { method: 'GET', headers } : { method: 'GET' });

  if (!response.ok) {
    throw new Error(`tRPC request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { result?: { data?: { json: Result } } };
  return payload.result?.data?.json as Result;
}
