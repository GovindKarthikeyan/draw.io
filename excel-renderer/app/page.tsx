'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import ExcelUploader from './components/ExcelUploader';
import SheetRenderer from './components/SheetRenderer';

export default function Home() {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

  const handleFileLoaded = (wb: XLSX.WorkBook) => {
    setWorkbook(wb);
  };

  const handlePrint = () => {
    console.log('Print initiated');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Excel File Renderer
          </h1>
          <p className="text-gray-600">
            Upload Excel files and view them with pixel-perfect formatting
          </p>
        </header>

        <main className="flex flex-col items-center gap-8">
          {!workbook ? (
            <ExcelUploader onFileLoaded={handleFileLoaded} />
          ) : (
            <div className="w-full">
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => setWorkbook(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  ← Upload Different File
                </button>
              </div>
              <SheetRenderer workbook={workbook} onPrint={handlePrint} />
            </div>
          )}
        </main>

        <footer className="text-center mt-12 text-gray-600 text-sm">
          <p>Supports .xlsx, .xls, and .xlsm file formats</p>
        </footer>
      </div>
    </div>
  );
}
