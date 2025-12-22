// Client-side Application Insights configuration
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

let appInsights: ApplicationInsights | null = null;
let reactPlugin: ReactPlugin | null = null;

/**
 * Initialize Application Insights for client-side tracking
 * This should be called once when the app starts
 */
export function initializeAppInsights(): {
  appInsights: ApplicationInsights;
  reactPlugin: ReactPlugin;
} | null {
  // Get connection string from environment variable
  const connectionString = process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING;

  if (!connectionString) {
    console.warn('Application Insights connection string not found. Telemetry disabled.');
    return null;
  }

  if (typeof window === 'undefined') {
    // Server-side rendering - don't initialize
    return null;
  }

  if (!appInsights) {
    reactPlugin = new ReactPlugin();

    appInsights = new ApplicationInsights({
      config: {
        connectionString: connectionString,
        enableAutoRouteTracking: true, // Automatically track route changes
        enableCorsCorrelation: true,
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
        disableFetchTracking: false,
        disableAjaxTracking: false,
        disableExceptionTracking: false,
        autoTrackPageVisitTime: true,
        extensions: [reactPlugin],
      },
    });

    appInsights.loadAppInsights();

    // Set authenticated user context if available
    appInsights.addTelemetryInitializer((envelope) => {
      envelope.tags = envelope.tags || [];
      envelope.tags['ai.cloud.role'] = 'excel-renderer-client';
      envelope.tags['ai.cloud.roleInstance'] = window.location.hostname;
    });

    console.log('Application Insights initialized for client-side tracking');
  }

  // TypeScript guard - both should be initialized together
  if (!appInsights || !reactPlugin) {
    return null;
  }

  return { appInsights, reactPlugin };
}

/**
 * Get the Application Insights instance
 */
export function getAppInsights(): ApplicationInsights | null {
  return appInsights;
}

/**
 * Get the React Plugin instance
 */
export function getReactPlugin(): ReactPlugin | null {
  return reactPlugin;
}

/**
 * Track a custom event
 */
export function trackEvent(name: string, properties?: { [key: string]: any }) {
  if (appInsights) {
    appInsights.trackEvent({ name }, properties);
  }
}

/**
 * Track a custom exception
 */
export function trackException(error: Error, severityLevel?: number) {
  if (appInsights) {
    appInsights.trackException({
      exception: error,
      severityLevel: severityLevel || 3, // Error level
    });
  }
}

/**
 * Track a custom metric
 */
export function trackMetric(name: string, average: number, properties?: { [key: string]: any }) {
  if (appInsights) {
    appInsights.trackMetric({ name, average }, properties);
  }
}

/**
 * Track a page view
 */
export function trackPageView(name?: string, uri?: string) {
  if (appInsights) {
    appInsights.trackPageView({ name, uri });
  }
}

/**
 * Track custom trace/log
 */
export function trackTrace(
  message: string,
  severityLevel?: number,
  properties?: { [key: string]: any }
) {
  if (appInsights) {
    appInsights.trackTrace(
      {
        message,
        severityLevel: severityLevel || 1, // Informational level
      },
      properties
    );
  }
}

/**
 * Flush all pending telemetry
 */
export function flushAppInsights() {
  if (appInsights) {
    appInsights.flush();
  }
}
