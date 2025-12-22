# Excel File Renderer

A Next.js application that allows users to upload Excel files and view them with pixel-perfect formatting. The application renders Excel sheets exactly as they appear with all styles, colors, fonts, and formatting preserved.

## Features

- 📁 **File Upload**: Open a file dialog to select Excel files (.xlsx, .xls, .xlsm)
- 📊 **Multi-Sheet Support**: View all sheets in the Excel workbook
- 🎨 **Pixel-Perfect Rendering**: Preserves all formatting, styles, colors, and fonts
- 🖨️ **Print Functionality**: Two print options:
  - Browser-native print (standard print dialog)
  - Pixel-perfect print (converts sheets to images for exact reproduction)
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Navigate to the excel-renderer directory:
   ```bash
   cd excel-renderer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

### Deploy to IIS (Windows Server)

For deployment on Windows Server with IIS, see the [IIS Deployment Guide](./IIS_DEPLOYMENT.md).

Quick start for IIS:
```bash
npm run build
# Copy files to IIS directory
# Rename web.config.iisnode to web.config
# Configure IIS site
```

## How to Use

1. **Upload**: Click the "Choose Excel File" button to open a file dialog
2. **Select**: Choose an Excel file (.xlsx, .xls, or .xlsm format)
3. **View**: The application will display all sheets with preserved formatting
4. **Navigate**: Switch between sheets using the tab buttons
5. **Print**: 
   - Click "Print (Browser)" for standard printing
   - Click "Print (Pixel Perfect)" for image-based printing with exact formatting

## Technologies Used

- **Next.js 16**: React framework for server-side rendering and static site generation
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **xlsx**: Excel file parsing library
- **html2canvas**: HTML to image conversion for pixel-perfect printing
- **Azure Application Insights**: Comprehensive telemetry and monitoring (optional)

## Monitoring and Telemetry

This application includes optional Azure Application Insights integration for:
- Client-side telemetry (page views, events, errors)
- Server-side telemetry (requests, performance, dependencies)
- Middleware tracking (request correlation)

See [APPINSIGHTS.md](./APPINSIGHTS.md) for setup and configuration instructions.

## File Structure

```
excel-renderer/
├── app/
│   ├── components/
│   │   ├── ExcelUploader.tsx    # File upload component
│   │   └── SheetRenderer.tsx    # Excel sheet display component
│   ├── page.tsx                 # Main application page
│   ├── layout.tsx               # Application layout
│   └── globals.css              # Global styles
├── public/                      # Static assets
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## Supported Excel Formats

- `.xlsx` - Excel 2007+ (Office Open XML)
- `.xls` - Excel 97-2003
- `.xlsm` - Excel Macro-Enabled Workbook

## Security Considerations

⚠️ **Known Dependency Vulnerabilities**

The `xlsx` library (v0.18.5) has known vulnerabilities:
- **Prototype Pollution** (GHSA-4r6h-8v6p-xvw6) - High severity
- **Regular Expression Denial of Service** (GHSA-5pgg-2g8v-p4x9) - High severity

**Mitigation**: 
- This is a client-side application where users process their own files locally
- Files are not uploaded to a server or processed server-side
- The risk is limited to the user's own browser session
- Users should only upload Excel files from trusted sources
- Monitor for xlsx library updates and upgrade when a patched version becomes available

## Browser Support

The application works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Future Enhancements

- [ ] Export to PDF
- [ ] Advanced cell formatting support (merged cells, conditional formatting)
- [ ] Formula evaluation display
- [ ] Chart rendering
- [ ] Large file optimization
- [ ] Dark mode support
- [ ] Upgrade to patched xlsx library when available

## License

MIT
