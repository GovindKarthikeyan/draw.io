// Server-side Application Insights configuration
import * as appInsights from 'applicationinsights';

let client: appInsights.TelemetryClient | null = null;

/**
 * Initialize Application Insights for server-side tracking
 * This should be called once when the server starts
 */
export function initializeServerAppInsights(): appInsights.TelemetryClient | null {
  // Get connection string from environment variable
  const connectionString = process.env.APPINSIGHTS_CONNECTION_STRING;
  
  if (!connectionString) {
    console.warn('Server Application Insights connection string not found. Server-side telemetry disabled.');
    return null;
  }

  if (client) {
    return client;
  }

  try {
    // Setup Application Insights
    appInsights.setup(connectionString)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true, true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true)
      .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
      .start();

    client = appInsights.defaultClient;
    
    // Set cloud role
    client.context.tags[client.context.keys.cloudRole] = 'excel-renderer-server';
    client.context.tags[client.context.keys.cloudRoleInstance] = process.env.COMPUTERNAME || 'server-instance';
    
    console.log('Application Insights initialized for server-side tracking');
    
    return client;
  } catch (error) {
    console.error('Failed to initialize server Application Insights:', error);
    return null;
  }
}

/**
 * Get the Application Insights client
 */
export function getServerAppInsights(): appInsights.TelemetryClient | null {
  return client;
}

/**
 * Track a custom event on the server
 */
export function trackServerEvent(name: string, properties?: { [key: string]: string }) {
  if (client) {
    client.trackEvent({ name, properties });
  }
}

/**
 * Track a custom exception on the server
 */
export function trackServerException(error: Error, properties?: { [key: string]: string }) {
  if (client) {
    client.trackException({ exception: error, properties });
  }
}

/**
 * Track a custom metric on the server
 */
export function trackServerMetric(name: string, value: number, properties?: { [key: string]: string }) {
  if (client) {
    client.trackMetric({ name, value, properties });
  }
}

/**
 * Track a custom trace/log on the server
 */
export function trackServerTrace(message: string, properties?: { [key: string]: string }) {
  if (client) {
    client.trackTrace({ 
      message, 
      properties 
    });
  }
}

/**
 * Track a dependency call on the server
 */
export function trackServerDependency(
  dependencyTypeName: string,
  name: string,
  data: string,
  duration: number,
  success: boolean,
  resultCode?: string | number
) {
  if (client) {
    client.trackDependency({
      dependencyTypeName,
      name,
      data,
      duration,
      success,
      resultCode: resultCode?.toString()
    });
  }
}

/**
 * Flush all pending telemetry on the server
 */
export function flushServerAppInsights(): Promise<void> {
  return new Promise((resolve) => {
    if (client) {
      client.flush();
      // Wait a bit for flush to complete
      setTimeout(() => resolve(), 1000);
    } else {
      resolve();
    }
  });
}
