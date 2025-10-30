'use client';

import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import appConfig from '@/content/constants/config';

let faroSingleton: ReturnType<typeof initializeFaro> | null = null;

type FaroClientConfig = {
  url: string;
  appName: string;
  appVersion: string;
  environment: string;
};

function buildConfig(overrides: Partial<FaroClientConfig> = {}): FaroClientConfig | null {
  const faro = appConfig?.grafanaCloud?.addOns?.faro;

  if (!faro || !faro.enabled) return null;

  const url = overrides.url ?? faro.url ?? process.env.NEXT_PUBLIC_FARO_URL ?? '';
  if (!url) return null;

  return {
    url,
    appName: overrides.appName ?? faro.appName ?? process.env.NEXT_PUBLIC_FARO_APP_NAME ?? 'helix-app',
    appVersion:
      overrides.appVersion ?? faro.appVersion ?? process.env.NEXT_PUBLIC_FARO_APP_VERSION ?? process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev',
    environment:
      overrides.environment ?? faro.environment ?? process.env.NEXT_PUBLIC_FARO_APP_ENV ?? process.env.NODE_ENV ?? 'development',
  };
}

export function initFaro(overrides: Partial<FaroClientConfig> = {}) {
  if (faroSingleton || typeof window === 'undefined') {
    return faroSingleton;
  }

  const config = buildConfig(overrides);

  if (!config) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[Faro] configuration missing or disabled; skipping instrumentation.');
    }
    return null;
  }

  faroSingleton = initializeFaro({
    url: config.url,
    app: {
      name: config.appName,
      version: config.appVersion,
      environment: config.environment,
    },
    instrumentations: [...getWebInstrumentations(), new TracingInstrumentation()],
  });

  return faroSingleton;
}

export function getFaroInstance() {
  return faroSingleton;
}
