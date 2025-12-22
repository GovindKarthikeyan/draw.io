# IIS Deployment Guide for Excel File Renderer

This guide explains how to deploy the Next.js Excel File Renderer application on Windows Server with IIS (Internet Information Services).

## Prerequisites

Before deploying to IIS, ensure you have:

- Windows Server 2016 or later (or Windows 10/11 Pro)
- IIS 10.0 or later installed and configured
- Node.js 18.x or later installed on the server
- URL Rewrite Module for IIS installed
- **iisnode** module installed (for Node.js hosting in IIS)

## Installation Steps

### 1. Install Required IIS Components

#### Install IIS (if not already installed)

**Windows Server:**

```powershell
Install-WindowsFeature -name Web-Server -IncludeManagementTools
```

**Windows 10/11:**

- Go to Control Panel → Programs → Turn Windows features on or off
- Enable "Internet Information Services"
- Enable "World Wide Web Services"

#### Install URL Rewrite Module

Download and install from: https://www.iis.net/downloads/microsoft/url-rewrite

Or using Chocolatey:

```powershell
choco install urlrewrite
```

#### Install iisnode

Download and install from: https://github.com/Azure/iisnode/releases

Or using Chocolatey:

```powershell
choco install iisnode
```

### 2. Build the Application

On your development machine or on the server:

```bash
cd excel-renderer
npm install
npm run build
```

This creates an optimized production build in the `.next` directory with standalone output.

### 3. Prepare Deployment Files

Copy the following files/folders to your IIS website directory (e.g., `C:\inetpub\wwwroot\excel-renderer`):

```
excel-renderer/
├── .next/              # Build output
├── public/             # Static assets
├── node_modules/       # Dependencies
├── server.js           # Custom Node.js server
├── package.json
├── package-lock.json
├── next.config.ts
└── web.config.iisnode  # IIS configuration (rename to web.config)
```

**Important:** Rename `web.config.iisnode` to `web.config` in your deployment directory.

### 4. Configure IIS Website

#### Option A: Using IIS Manager (GUI)

1. Open IIS Manager
2. Right-click on "Sites" → "Add Website"
3. Configure the site:
   - **Site name**: ExcelRenderer
   - **Physical path**: `C:\inetpub\wwwroot\excel-renderer`
   - **Binding**:
     - Type: http
     - Port: 80 (or your preferred port)
     - Host name: yourdomain.com (optional)
4. Click "OK"

#### Option B: Using PowerShell

```powershell
# Create the website
New-IISSite -Name "ExcelRenderer" `
  -PhysicalPath "C:\inetpub\wwwroot\excel-renderer" `
  -BindingInformation "*:80:"

# Set the application pool
Set-ItemProperty "IIS:\Sites\ExcelRenderer" -Name applicationPool -Value "DefaultAppPool"
```

### 5. Configure Application Pool

1. In IIS Manager, go to "Application Pools"
2. Select your application pool (or create a new one)
3. Click "Basic Settings"
4. Set:
   - **.NET CLR version**: No Managed Code
   - **Managed pipeline mode**: Integrated
5. Click "Advanced Settings"
6. Set:
   - **Enable 32-Bit Applications**: False
   - **Identity**: ApplicationPoolIdentity (or custom account)
7. Click "OK"

### 6. Set Folder Permissions

Grant the IIS application pool identity read/write access to:

```powershell
# Grant permissions (replace with your actual path and app pool)
$path = "C:\inetpub\wwwroot\excel-renderer"
$acl = Get-Acl $path

# Add IIS AppPool identity
$identity = "IIS AppPool\DefaultAppPool"
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule($identity, "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($rule)
Set-Acl $path $acl

# Create iisnode log directory
New-Item -Path "$path\iisnode" -ItemType Directory -Force
```

## Deployment Options

### Option 1: iisnode with Custom Server (Recommended)

This method uses iisnode to host the Node.js server within IIS.

**Configuration:**

- Use `web.config.iisnode` (renamed to `web.config`)
- Runs `server.js` through iisnode
- Better performance and process management

**Start Command:**
The application starts automatically when IIS receives a request to the site.

### Option 2: Reverse Proxy to Node.js

This method runs Next.js separately and uses IIS as a reverse proxy.

**Steps:**

1. Use `web.config` (the basic one, not iisnode version)
2. Install Application Request Routing (ARR) for IIS
3. Start the Next.js server manually:

```powershell
# Using PM2 (recommended for production)
npm install -g pm2
pm2 start npm --name "excel-renderer" -- start
pm2 save
pm2 startup
```

Or use a Windows Service wrapper like node-windows:

```powershell
npm install -g node-windows
# Create a service script following node-windows documentation
```

### Option 3: Standalone Static Export (Limited Features)

For static-only deployment without server-side rendering:

**Note:** This limits some Next.js features like API routes and server-side rendering.

```bash
# Modify next.config.ts to add:
# output: 'export'

npm run build
# Copy the 'out' directory to IIS
# Configure IIS to serve static files
```

## Environment Variables

Create a `.env.production` file or set environment variables:

```
NODE_ENV=production
PORT=3000
HOSTNAME=localhost
```

For iisnode, you can also use `iisnode.yml`:

```yaml
node_env: production
loggingEnabled: true
devErrorsEnabled: false
```

## Verification

After deployment:

1. Browse to your website URL (e.g., http://localhost or http://yourdomain.com)
2. You should see the Excel File Renderer upload page
3. Test uploading an Excel file
4. Check that printing works correctly

## Troubleshooting

### Application doesn't start

**Check iisnode logs:**

```
C:\inetpub\wwwroot\excel-renderer\iisnode\*.log
```

**Common issues:**

- Node.js not in PATH: Add Node.js installation directory to system PATH
- Missing dependencies: Run `npm install` in the deployment directory
- Permissions: Ensure IIS AppPool identity has access to all files

### 500 Internal Server Error

1. Enable detailed errors in `web.config`:
   ```xml
   <httpErrors errorMode="Detailed" />
   ```
2. Check Event Viewer → Windows Logs → Application
3. Check iisnode logs

### Static files not loading

1. Verify URL Rewrite module is installed
2. Check `web.config` rewrite rules
3. Ensure `.next/static` and `public` directories exist

### Performance issues

1. Increase iisnode process count:
   ```xml
   <iisnode nodeProcessCountPerApplication="4" />
   ```
2. Enable caching in IIS
3. Consider using a CDN for static assets

## Security Best Practices

1. **Enable HTTPS**: Obtain an SSL certificate and configure HTTPS binding

   ```powershell
   New-IISSiteBinding -Name "ExcelRenderer" -Protocol https -Port 443 -CertificateThumbPrint "YOUR_CERT_THUMBPRINT"
   ```

2. **Set security headers**: Already included in web.config

3. **Restrict file uploads**: The current config allows 50MB files, adjust if needed

4. **Regular updates**: Keep Node.js, npm packages, and IIS modules updated

5. **Firewall rules**: Configure Windows Firewall to allow traffic on necessary ports

## Monitoring

### Using iisnode

Monitor through:

- IIS Manager logs
- iisnode logs in `/iisnode` directory
- Windows Event Viewer

### Using PM2 (if using reverse proxy)

```powershell
pm2 list
pm2 logs excel-renderer
pm2 monit
```

## Updating the Application

To update:

1. Build the new version:

   ```bash
   npm run build
   ```

2. Stop IIS site:

   ```powershell
   Stop-IISSite -Name "ExcelRenderer"
   ```

3. Copy new files (overwrite `.next`, update `node_modules` if needed)

4. Start IIS site:
   ```powershell
   Start-IISSite -Name "ExcelRenderer"
   ```

For zero-downtime updates, consider using:

- Multiple application pools with load balancing
- Blue-green deployment strategy
- IIS Application Initialization module

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [iisnode GitHub Repository](https://github.com/Azure/iisnode)
- [IIS URL Rewrite Module](https://www.iis.net/downloads/microsoft/url-rewrite)
- [Application Request Routing](https://www.iis.net/downloads/microsoft/application-request-routing)

## Support

For issues specific to:

- **IIS/Windows**: Check IIS logs and Windows Event Viewer
- **Next.js**: Refer to Next.js documentation
- **iisnode**: Check iisnode GitHub issues

## Production Checklist

- [ ] Node.js installed on server
- [ ] IIS and required modules installed (URL Rewrite, iisnode)
- [ ] Application built with `npm run build`
- [ ] Files copied to IIS directory
- [ ] `web.config` properly configured
- [ ] Application pool configured correctly
- [ ] Folder permissions set
- [ ] HTTPS configured (recommended)
- [ ] Firewall rules configured
- [ ] Environment variables set
- [ ] Application tested and verified
- [ ] Monitoring configured
- [ ] Backup strategy in place
