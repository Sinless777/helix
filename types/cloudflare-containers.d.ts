declare module '@cloudflare/containers' {
  export class Container {
    defaultPort?: number;
    sleepAfter?: string;
    fetch(request: Request): Promise<Response>;
  }

  export function getContainer(
    binding: string,
    sessionId: string
  ): {
    fetch(request: Request): Promise<Response>;
  };
}
