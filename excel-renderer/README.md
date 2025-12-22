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

## License

MIT
