// instrumentation.ts
import type { SpanExporter, SpanProcessor, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { registerOTel } from '@vercel/otel';

// Optional: customize these via environment variables
const SERVICE_NAME = process.env.OTEL_SERVICE_NAME ?? 'helix-ai-nextjs';
const EXPORTER_URL = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const RESOURCE_ATTRIBUTES = process.env.OTEL_RESOURCE_ATTRIBUTES;

/**
 * Example SpanProcessor to enrich spans with custom attributes.
 */
class CustomAttributeProcessor implements SpanProcessor {
  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
  shutdown(): Promise<void> {
    return Promise.resolve();
  }
  onStart(_span: any): void {
    // no-op
  }
  onEnd(span: ReadableSpan): void {
    span.attributes['service.version'] = process.env.npm_package_version ?? 'unknown';
    span.attributes['env'] = process.env.NODE_ENV ?? 'development';
  }
}

/**
 * Register instrumentation for the application.
 * Call this as early as possible (top-level import or entry point).
 */
export function register() {
  let traceExporter: SpanExporter | undefined;

  if (EXPORTER_URL) {
    // require the OTLP exporter only if needed
    const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
    let headers: Record<string, string> | undefined = undefined;
    if (process.env.OTEL_EXPORTER_OTLP_HEADERS) {
      headers = Object.fromEntries(
        process.env.OTEL_EXPORTER_OTLP_HEADERS.split(',').map((h) => {
          const eqIdx = h.indexOf('=');
          if (eqIdx === -1) return [h, ''];
          return [h.slice(0, eqIdx).trim(), decodeURIComponent(h.slice(eqIdx + 1).trim())];
        })
      );
    }
    traceExporter = new OTLPTraceExporter({
      url: EXPORTER_URL,
      headers,
    });
  }

  // Parse resource attributes from env
  const resourceAttrs: Record<string, string> = {};
  if (RESOURCE_ATTRIBUTES) {
    RESOURCE_ATTRIBUTES.split(',').forEach((attr) => {
      const eqIdx = attr.indexOf('=');
      if (eqIdx !== -1) {
        resourceAttrs[attr.slice(0, eqIdx).trim()] = attr.slice(eqIdx + 1).trim();
      }
    });
  }

  const config: any = {
    serviceName: SERVICE_NAME,
    spanProcessors: [new CustomAttributeProcessor()],
    attributes: {
      'deployment.platform': 'vercel',
      'deployment.region': process.env.VERCEL_REGION || '',
      ...resourceAttrs,
    },
    ...(traceExporter ? { traceExporter } : {}),
  };

  // Register the instrumentation
  registerOTel(config);
}

import { type Instrumentation } from 'next';

/**
 * Error tracing and warning tracking for Next.js server errors.
 * Sends error details to an observability endpoint (replace with your endpoint).
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  // Cast err to Error & { digest?: string }
  const errorObj = err as Error & { digest?: string };
  try {
    await fetch(
      process.env.OTEL_ERROR_ENDPOINT || 'https://your-observability-endpoint/report-error',
      {
        method: 'POST',
        body: JSON.stringify({
          message: errorObj.message,
          digest: errorObj.digest,
          request,
          context,
          level: 'error',
          timestamp: Date.now(),
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (warn) {
    // Optionally log warning if error reporting fails
    console.warn('[otel] Failed to report error:', warn);
  }
};
