'use client';

import { useEffect } from 'react';
import { initializeAppInsights } from '@/lib/appInsights.client';

export default function AppInsightsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Application Insights on client mount
    initializeAppInsights();
  }, []);

  return <>{children}</>;
}
