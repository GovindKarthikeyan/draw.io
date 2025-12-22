'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { trackEvent, trackException, trackMetric } from '@/lib/appInsights.client';

interface ExcelUploaderProps {
  onFileLoaded: (workbook: XLSX.WorkBook) => void;
}

export default function ExcelUploader({ onFileLoaded }: ExcelUploaderProps) {
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const startTime = Date.now();

    // Track file upload attempt
    trackEvent('ExcelFileUploadAttempt', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12',
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|xlsm)$/i)) {
      trackEvent('ExcelFileUploadFailed', {
        fileName: file.name,
        reason: 'Invalid file type',
      });
      alert('Please select a valid Excel file (.xlsx, .xls, .xlsm)');
      return;
    }

    setFileName(file.name);

    // Read the file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, {
          type: 'array',
          cellStyles: true,
          cellHTML: true,
          cellNF: true,
          cellDates: true,
        });

        const loadTime = Date.now() - startTime;

        // Track successful file load
        trackEvent('ExcelFileUploadSuccess', {
          fileName: file.name,
          fileSize: file.size,
          sheetCount: workbook.SheetNames.length,
          loadTimeMs: loadTime,
        });

        // Track load time metric
        trackMetric('ExcelFileLoadTime', loadTime, {
          fileName: file.name,
          fileSize: file.size.toString(),
        });

        onFileLoaded(workbook);
      } catch (error) {
        console.error('Error reading Excel file:', error);

        // Track exception
        trackException(error as Error);
        trackEvent('ExcelFileUploadFailed', {
          fileName: file.name,
          reason: 'Parse error',
          error: (error as Error).message,
        });

        alert('Error reading Excel file. Please try again.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleButtonClick = () => {
    trackEvent('ExcelFileUploadButtonClicked');
    fileInputRef.current?.click();
  };

  return (
    <div
      className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg"
      role="region"
      aria-labelledby="upload-title"
    >
      <h2 id="upload-title" className="text-2xl font-bold mb-4 text-gray-800">
        Upload Excel File
      </h2>
      <p className="text-gray-600 mb-4">
        Select an Excel file to view and print with exact formatting
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.xlsm,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12"
        onChange={handleFileSelect}
        className="hidden"
        id="file-input"
        aria-label="Choose Excel file to upload"
      />

      <button
        onClick={handleButtonClick}
        className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        aria-label="Click to choose an Excel file"
        type="button"
      >
        Choose Excel File
      </button>

      {fileName && (
        <div
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm text-green-800">
            <span className="font-semibold">Selected:</span> {fileName}
          </p>
        </div>
      )}

      {/* Accessible instructions */}
      <div className="mt-4 text-xs text-gray-500">
        <p>Supported formats: Excel 2007+ (.xlsx), Excel 97-2003 (.xls), Macro-enabled (.xlsm)</p>
        <p className="mt-1">Maximum file size: 50MB</p>
      </div>
    </div>
  );
}
