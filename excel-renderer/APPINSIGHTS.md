# Application Insights Integration Guide

This application includes comprehensive Azure Application Insights telemetry for client-side, server-side, and middleware tracking.

## Features

### Client-Side Telemetry

- Automatic page view tracking
- Route change tracking
- Exception tracking
- Custom event tracking for user interactions
- Performance metrics (file load times, rendering times)
- User session tracking

### Server-Side Telemetry

- HTTP request tracking
- Performance monitoring
- Dependency tracking
- Exception tracking
- Custom logging

### Middleware Telemetry

- Request tracking with unique IDs
- Request timing
- Automatic correlation between client and server

## Setup

### 1. Create Application Insights Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new "Application Insights" resource
3. Copy the **Connection String** from the Overview page

### 2. Configure Environment Variables

Create a `.env.local` file in the `excel-renderer` directory:

```bash
# For client-side telemetry (required for browser tracking)
NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;IngestionEndpoint=https://region.in.applicationinsights.azure.com/;LiveEndpoint=https://region.livediagnostics.monitor.azure.com/

# For server-side telemetry (required for server tracking)
APPINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;IngestionEndpoint=https://region.in.applicationinsights.azure.com/;LiveEndpoint=https://region.livediagnostics.monitor.azure.com/
```

**Note:** You can use the same connection string for both or create separate Application Insights resources for client and server.

### 3. Restart the Application

```bash
npm run dev
# or for production
npm run build
npm start
```

## Tracked Events

### Client-Side Events

#### File Upload

- **ExcelFileUploadButtonClicked** - User clicks the upload button
- **ExcelFileUploadAttempt** - File selection started
  - Properties: fileName, fileSize, fileType
- **ExcelFileUploadSuccess** - File successfully loaded
  - Properties: fileName, fileSize, sheetCount, loadTimeMs
- **ExcelFileUploadFailed** - File upload/parsing failed
  - Properties: fileName, reason, error

#### Sheet Navigation

- **SheetNavigated** - User switches between sheets
  - Properties: sheetName, sheetIndex, totalSheets

#### Printing

- **PrintButtonClicked** - User clicks print button
  - Properties: printMode (browser/pixelPerfect), sheetCount, activeSheet
- **PrintSuccess** - Print operation completed
  - Properties: printMode, sheetCount, totalTimeMs
- **PrintFailed** - Print operation failed
  - Properties: reason

#### Page Views

- **Home** - Main page view

#### Other

- **WorkbookLoaded** - Excel workbook loaded into viewer
  - Properties: sheetCount
- **UploadDifferentFileClicked** - User returns to upload screen

### Custom Metrics

- **ExcelFileLoadTime** - Time to parse Excel file (milliseconds)
  - Properties: fileName, fileSize
- **SheetToImageConversionTime** - Time to convert sheet to image (milliseconds)
  - Properties: sheetName, sheetIndex
- **PixelPerfectPrintTotalTime** - Total time for pixel-perfect print (milliseconds)
  - Properties: sheetCount

### Exceptions

All JavaScript errors and unhandled exceptions are automatically tracked with:

- Error message
- Stack trace
- Component information (when available)
- User session context

### Server-Side Events

- **ServerStarted** - Server initialization
  - Properties: hostname, port, environment
- **ServerShutdown** - Graceful shutdown
- HTTP request tracking (automatic)
- Dependency tracking (automatic)
- Performance counters (automatic)

## Viewing Telemetry

### Azure Portal

1. Go to your Application Insights resource
2. Navigate to different sections:
   - **Overview** - Summary metrics
   - **Live Metrics** - Real-time telemetry stream
   - **Failures** - Exceptions and failed requests
   - **Performance** - Response times and dependencies
   - **Usage** - User behavior and retention
   - **Logs** - Query telemetry with KQL

### Kusto Query Language (KQL) Examples

#### View all custom events

```kql
customEvents
| where timestamp > ago(24h)
| project timestamp, name, customDimensions
| order by timestamp desc
```

#### File upload success rate

```kql
customEvents
| where name in ("ExcelFileUploadSuccess", "ExcelFileUploadFailed")
| summarize Total = count(), Success = countif(name == "ExcelFileUploadSuccess") by bin(timestamp, 1h)
| extend SuccessRate = Success * 100.0 / Total
| project timestamp, SuccessRate, Total, Success
```

#### Average file load time

```kql
customMetrics
| where name == "ExcelFileLoadTime"
| summarize avg(value), percentile(value, 50), percentile(value, 95) by bin(timestamp, 1h)
```

#### Print mode usage

```kql
customEvents
| where name == "PrintButtonClicked"
| extend printMode = tostring(customDimensions.printMode)
| summarize count() by printMode
```

#### Sheet navigation patterns

```kql
customEvents
| where name == "SheetNavigated"
| extend sheetName = tostring(customDimensions.sheetName)
| summarize NavigationCount = count() by sheetName
| order by NavigationCount desc
```

#### Error tracking

```kql
exceptions
| where timestamp > ago(24h)
| project timestamp, type, outerMessage, innerMessage, operation_Name
| order by timestamp desc
```

## Disabling Telemetry

To disable Application Insights:

1. Remove or comment out the environment variables in `.env.local`
2. Restart the application

The application will log a warning but continue to work normally:

```
Application Insights connection string not found. Telemetry disabled.
```

## Privacy Considerations

Application Insights collects:

- ✅ Anonymous usage statistics
- ✅ Performance metrics
- ✅ Error logs
- ✅ Session information
- ❌ **No file content** - Excel file data is NOT sent to Application Insights
- ❌ **No PII** - Personal identifiable information is not tracked

Only metadata such as file sizes, sheet counts, and processing times are tracked.

## Production Configuration

### IIS Deployment

When deploying to IIS, set environment variables using one of these methods:

#### Method 1: iisnode.yml

```yaml
node_env: production
APPINSIGHTS_CONNECTION_STRING: InstrumentationKey=xxx...
```

#### Method 2: web.config

```xml
<configuration>
  <system.webServer>
    <iisnode>
      <environmentVariables>
        <add name="APPINSIGHTS_CONNECTION_STRING" value="InstrumentationKey=xxx..." />
        <add name="NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING" value="InstrumentationKey=xxx..." />
      </environmentVariables>
    </iisnode>
  </system.webServer>
</configuration>
```

#### Method 3: System Environment Variables

```powershell
[System.Environment]::SetEnvironmentVariable("APPINSIGHTS_CONNECTION_STRING", "InstrumentationKey=xxx...", "Machine")
```

### Docker Deployment

```dockerfile
ENV APPINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxx...
ENV NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxx...
```

### Cloud Platforms

- **Azure App Service**: Configure in Application Settings
- **Heroku**: Use Config Vars
- **Vercel**: Use Environment Variables in project settings
- **AWS**: Use Parameter Store or Secrets Manager

## Troubleshooting

### Telemetry not appearing

1. **Check connection string**:
   - Verify it starts with `InstrumentationKey=`
   - Ensure no extra spaces or line breaks

2. **Check environment variable names**:
   - Client-side must be prefixed with `NEXT_PUBLIC_`
   - Server-side has no prefix

3. **Restart the application** after changing environment variables

4. **Check browser console** for initialization messages:

   ```
   Application Insights initialized for client-side tracking
   ```

5. **Check server logs** for initialization messages:
   ```
   Server Application Insights initialized
   ```

### Data delay

- Telemetry can take 2-5 minutes to appear in Azure Portal
- Use Live Metrics for real-time data

### Development vs Production

- In development, telemetry includes more verbose logging
- In production, only essential data is collected

## Cost Optimization

Application Insights costs are based on data volume. To optimize:

1. **Sampling**: Configure sampling to reduce data volume
2. **Filtering**: Filter out noisy events
3. **Adaptive sampling**: Automatically adjust based on traffic

See [Azure Application Insights Pricing](https://azure.microsoft.com/pricing/details/monitor/) for details.

## Advanced Configuration

### Custom Telemetry

Use the helper functions in `lib/appInsights.client.ts` and `lib/appInsights.server.ts`:

```typescript
// Client-side
import { trackEvent, trackMetric, trackException } from '@/lib/appInsights.client';

trackEvent('CustomEvent', { property: 'value' });
trackMetric('CustomMetric', 123);
trackException(new Error('Custom error'));
```

```typescript
// Server-side
import { trackServerEvent, trackServerMetric } from '@/lib/appInsights.server';

trackServerEvent('ServerCustomEvent', { property: 'value' });
trackServerMetric('ServerCustomMetric', 123);
```

### Telemetry Correlation

Client and server telemetry is automatically correlated using:

- Operation IDs
- Request IDs
- Session IDs

This allows you to trace a user's journey across client and server.

## Resources

- [Application Insights Documentation](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [Application Insights JavaScript SDK](https://github.com/microsoft/ApplicationInsights-JS)
- [Application Insights Node.js SDK](https://github.com/microsoft/ApplicationInsights-node.js)
- [Kusto Query Language Reference](https://docs.microsoft.com/azure/data-explorer/kusto/query/)

## Support

For issues with:

- **Application Insights setup**: Check Azure documentation
- **Integration issues**: Check this documentation
- **Custom telemetry**: Refer to helper function examples above
