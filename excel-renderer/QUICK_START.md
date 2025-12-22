# Excel File Renderer - Quick Start Guide

## Overview

This Next.js application provides a web-based interface to upload, view, and print Excel files with pixel-perfect formatting preservation.

## Installation & Setup

### Navigate to the Application

```bash
cd excel-renderer
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The application will be available at: http://localhost:3000

### Build for Production

```bash
npm run build
npm start
```

## How to Use

### 1. Upload an Excel File

- Click the "Choose Excel File" button
- Select an Excel file (.xlsx, .xls, or .xlsm format)
- The file will be processed and displayed immediately

### 2. View Excel Sheets

- All sheets from your Excel workbook will be displayed
- Use the tab buttons at the top to switch between sheets
- The current sheet is highlighted in blue

### 3. Print Options

The application provides two printing methods:

#### Print (Browser)

- Uses your browser's native print functionality
- Click "Print (Browser)" button
- Standard browser print dialog will open
- Suitable for quick printing

#### Print (Pixel Perfect)

- Converts sheets to high-resolution images before printing
- Click "Print (Pixel Perfect)" button
- Opens a new window with image-based preview
- Ensures exact formatting preservation
- Best for maintaining precise layout and styling

### 4. Upload Different File

- Click "← Upload Different File" to return to the upload screen
- Select a new Excel file to process

## Features

### ✅ Supported Excel Formats

- `.xlsx` - Excel 2007+ (Office Open XML)
- `.xls` - Excel 97-2003
- `.xlsm` - Excel Macro-Enabled Workbook

### ✅ Formatting Preservation

- Cell borders and grid lines
- Font styles (bold, italic)
- Font sizes and families
- Text colors
- Background colors
- Text alignment (left, center, right, justify)
- Cell formulas (displayed as formulas)

### ✅ Multi-Sheet Support

- View all sheets in a workbook
- Easy navigation between sheets
- Each sheet rendered independently

## Technical Details

### Architecture

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **Excel Parsing**: xlsx library (SheetJS)
- **Image Conversion**: html2canvas for pixel-perfect printing

### File Processing

1. File is read client-side using FileReader API
2. Excel file is parsed using xlsx library
3. Sheet data is extracted with formatting information
4. Rendered as HTML tables with CSS styling
5. Print functions convert to images when needed

## Browser Compatibility

✅ Chrome/Chromium (Recommended)
✅ Firefox
✅ Safari
✅ Edge

## Tips for Best Results

1. **File Size**: Works best with Excel files under 10MB
2. **Complex Formatting**: Basic formatting is preserved; advanced features (merged cells, charts) may not render perfectly
3. **Formulas**: Displays formulas as text, not calculated results
4. **Print Quality**: Use "Pixel Perfect" mode for exact formatting in prints
5. **Browser**: Use Chrome or Edge for best performance

## Troubleshooting

### File Won't Upload

- Ensure file is a valid Excel format (.xlsx, .xls, .xlsm)
- Check file is not corrupted
- Try a different browser

### Formatting Looks Different

- Some advanced Excel features are not supported
- Use "Pixel Perfect" print for better formatting preservation
- Complex conditional formatting may not display correctly

### Print Quality Issues

- Use "Print (Pixel Perfect)" instead of "Print (Browser)"
- Ensure sufficient printer resolution
- Try landscape orientation for wide sheets

## Development

### Project Structure

```
excel-renderer/
├── app/
│   ├── components/
│   │   ├── ExcelUploader.tsx    # File upload UI
│   │   └── SheetRenderer.tsx    # Excel rendering logic
│   ├── page.tsx                 # Main page
│   ├── layout.tsx               # App layout
│   └── globals.css              # Global styles
├── public/                      # Static assets
├── package.json                 # Dependencies
└── README.md                    # Documentation
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Security Notes

⚠️ The xlsx library has known vulnerabilities:

- Prototype Pollution (High)
- Regular Expression Denial of Service (High)

**Impact**: Limited - This is a client-side application. Files are processed locally in the browser.

**Recommendation**: Only upload Excel files from trusted sources.

## Support

For issues or questions:

1. Check the README.md file
2. Review the troubleshooting section
3. Check browser console for error messages
4. Ensure all dependencies are installed correctly

## License

MIT
