'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import ExcelUploader from './components/ExcelUploader';
import SheetRenderer from './components/SheetRenderer';
import { trackEvent, trackPageView } from '@/lib/appInsights.client';

export default function Home() {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

  React.useEffect(() => {
    // Track page view
    trackPageView('Home', '/');
  }, []);

  const handleFileLoaded = (wb: XLSX.WorkBook) => {
    setWorkbook(wb);
    trackEvent('WorkbookLoaded', {
      sheetCount: wb.SheetNames.length.toString(),
    });
  };

  const handlePrint = () => {
    console.log('Print initiated');
  };

  const handleUploadDifferent = () => {
    trackEvent('UploadDifferentFileClicked');
    setWorkbook(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header with SEO-friendly heading structure */}
        <header className="text-center mb-8" role="banner">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Excel File Renderer</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload Excel files and view them with pixel-perfect formatting
          </p>
        </header>

        {/* Main Content Area */}
        <main id="main-content" className="flex flex-col items-center gap-8" role="main">
          {!workbook ? (
            // Upload Section
            <section aria-labelledby="upload-heading" className="w-full max-w-2xl">
              <h2 id="upload-heading" className="sr-only">
                Upload Excel File
              </h2>
              <ExcelUploader onFileLoaded={handleFileLoaded} />
            </section>
          ) : (
            // Viewer Section
            <section aria-labelledby="viewer-heading" className="w-full">
              <h2 id="viewer-heading" className="sr-only">
                Excel File Viewer
              </h2>
              <div className="flex justify-center mb-4">
                <button
                  onClick={handleUploadDifferent}
                  className="bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                  aria-label="Upload a different Excel file"
                >
                  ← Upload Different File
                </button>
              </div>
              <SheetRenderer workbook={workbook} onPrint={handlePrint} />
            </section>
          )}
        </main>

        {/* Page Footer */}
        <footer className="text-center mt-12 text-gray-600 text-sm" role="contentinfo">
          <p>
            Supports <abbr title="Excel Spreadsheet">xlsx</abbr>,{' '}
            <abbr title="Excel 97-2003">xls</abbr>, and{' '}
            <abbr title="Excel Macro-Enabled">xlsm</abbr> file formats
          </p>
          <nav aria-label="Footer navigation" className="mt-4">
            <ul className="flex justify-center gap-6 flex-wrap">
              <li>
                <a
                  href="/api/files"
                  className="hover:text-blue-600 focus:text-blue-600 focus:underline"
                >
                  File API
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/yourusername/excel-renderer"
                  className="hover:text-blue-600 focus:text-blue-600 focus:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="#privacy"
                  className="hover:text-blue-600 focus:text-blue-600 focus:underline"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </nav>
          <p className="mt-4 text-xs">
            © {new Date().getFullYear()} Excel File Renderer. All files are processed locally in
            your browser.
          </p>
        </footer>
      </div>
    </div>
  );
}
