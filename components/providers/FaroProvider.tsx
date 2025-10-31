'use client';

import { type ReactNode, useEffect } from 'react';

import { initFaro } from '@/lib/analytics/faro.client';

type FaroProviderProps = {
  children: ReactNode;
};

export function FaroProvider({ children }: FaroProviderProps) {
  useEffect(() => {
    initFaro();
  }, []);

  return <>{children}</>;
}

export default FaroProvider;
