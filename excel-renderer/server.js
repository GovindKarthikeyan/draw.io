// Custom server for IIS deployment with iisnode
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Initialize Application Insights for server-side telemetry
let appInsightsClient = null;
if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  try {
    const appInsights = require('applicationinsights');
    appInsights.setup(process.env.APPINSIGHTS_CONNECTION_STRING)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true, true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true)
      .start();
    
    appInsightsClient = appInsights.defaultClient;
    appInsightsClient.context.tags[appInsightsClient.context.keys.cloudRole] = 'excel-renderer-server';
    console.log('Server Application Insights initialized');
  } catch (error) {
    console.warn('Failed to initialize Application Insights:', error.message);
  }
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    const startTime = Date.now();
    
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
      
      // Track successful request
      if (appInsightsClient) {
        const duration = Date.now() - startTime;
        appInsightsClient.trackRequest({
          name: `${req.method} ${parsedUrl.pathname}`,
          url: req.url,
          duration: duration,
          resultCode: res.statusCode,
          success: res.statusCode < 400
        });
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      
      // Track exception
      if (appInsightsClient) {
        appInsightsClient.trackException({ exception: err });
      }
      
      res.statusCode = 500;
      res.end('Internal server error');
    }
  })
  .listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (appInsightsClient) {
      appInsightsClient.trackEvent({
        name: 'ServerStarted',
        properties: {
          hostname: hostname,
          port: port.toString(),
          environment: process.env.NODE_ENV || 'development'
        }
      });
    }
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    if (appInsightsClient) {
      appInsightsClient.trackEvent({ name: 'ServerShutdown' });
      appInsightsClient.flush();
    }
    process.exit(0);
  });
});
