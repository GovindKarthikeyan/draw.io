'use client';

import React, { useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

interface SheetRendererProps {
  workbook: XLSX.WorkBook;
  onPrint: () => void;
}

interface CellStyle {
  backgroundColor?: string;
  color?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  border?: string;
  fontSize?: string;
  fontFamily?: string;
}

export default function SheetRenderer({ workbook, onPrint }: SheetRendererProps) {
  const [activeSheetIndex, setActiveSheetIndex] = React.useState(0);
  const sheetRefs = useRef<(HTMLDivElement | null)[]>([]);

  const getCellStyle = (cell: XLSX.CellObject): CellStyle => {
    const style: CellStyle = {};
    
    // Default styling for Excel-like appearance
    style.border = '1px solid #d0d0d0';
    style.fontFamily = 'Arial, sans-serif';
    style.fontSize = '11px';
    
    // Check if cell has style information
    if (cell.s) {
      const cellStyle = cell.s as any;
      
      // Background color
      if (cellStyle.fgColor) {
        style.backgroundColor = `#${cellStyle.fgColor.rgb || 'ffffff'}`;
      }
      
      // Font color
      if (cellStyle.font?.color) {
        style.color = `#${cellStyle.font.color.rgb || '000000'}`;
      }
      
      // Font weight (bold)
      if (cellStyle.font?.bold) {
        style.fontWeight = 'bold';
      }
      
      // Font style (italic)
      if (cellStyle.font?.italic) {
        style.fontStyle = 'italic';
      }
      
      // Font size
      if (cellStyle.font?.sz) {
        style.fontSize = `${cellStyle.font.sz}px`;
      }
      
      // Text alignment
      if (cellStyle.alignment) {
        if (cellStyle.alignment.horizontal) {
          const align = cellStyle.alignment.horizontal;
          if (align === 'left' || align === 'center' || align === 'right' || align === 'justify') {
            style.textAlign = align;
          }
        }
      }
      
      // Border styling
      if (cellStyle.border) {
        const borderParts = [];
        if (cellStyle.border.top) borderParts.push('1px solid #000');
        if (cellStyle.border.bottom) borderParts.push('1px solid #000');
        if (cellStyle.border.left) borderParts.push('1px solid #000');
        if (cellStyle.border.right) borderParts.push('1px solid #000');
        if (borderParts.length > 0) {
          style.border = borderParts[0];
        }
      }
    }
    
    return style;
  };

  const renderSheet = (sheetName: string, sheetIndex: number) => {
    const worksheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    const rows = [];
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const row = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        
        let cellValue = '';
        let cellStyle: CellStyle = {
          border: '1px solid #d0d0d0',
          fontFamily: 'Arial, sans-serif',
          fontSize: '11px',
        };
        
        if (cell) {
          // Get cell value
          if (cell.f) {
            cellValue = cell.v !== undefined ? String(cell.v) : '';
          } else if (cell.v !== undefined) {
            cellValue = String(cell.v);
          }
          
          // Get cell style
          cellStyle = { ...cellStyle, ...getCellStyle(cell) };
        }
        
        row.push(
          <td
            key={`${R}-${C}`}
            style={{
              padding: '4px 8px',
              minWidth: '60px',
              maxWidth: '300px',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              ...cellStyle,
            }}
          >
            {cellValue}
          </td>
        );
      }
      rows.push(<tr key={R}>{row}</tr>);
    }
    
    return (
      <div
        key={sheetIndex}
        ref={(el) => {
          sheetRefs.current[sheetIndex] = el;
        }}
        className="sheet-container mb-8"
        style={{ display: activeSheetIndex === sheetIndex ? 'block' : 'none' }}
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Sheet: {sheetName}
        </h3>
        <div className="overflow-auto border border-gray-300 rounded bg-white">
          <table
            style={{
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              width: '100%',
            }}
          >
            <tbody>{rows}</tbody>
          </table>
        </div>
      </div>
    );
  };

  const handlePrint = () => {
    window.print();
    onPrint();
  };

  const handlePrintAsImage = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups for this site to print');
      return;
    }

    printWindow.document.write('<html><head><title>Print Excel Sheets</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { margin: 0; padding: 20px; }');
    printWindow.document.write('.sheet-page { page-break-after: always; margin-bottom: 20px; }');
    printWindow.document.write('img { max-width: 100%; height: auto; }');
    printWindow.document.write('h3 { font-family: Arial, sans-serif; margin-bottom: 10px; }');
    printWindow.document.write('</style></head><body>');

    for (let i = 0; i < workbook.SheetNames.length; i++) {
      const sheetElement = sheetRefs.current[i];
      if (sheetElement) {
        try {
          // Temporarily show the sheet
          const originalDisplay = sheetElement.style.display;
          sheetElement.style.display = 'block';
          
          const canvas = await html2canvas(sheetElement, {
            scale: 2,
            logging: false,
            backgroundColor: '#ffffff',
          });
          
          sheetElement.style.display = originalDisplay;
          
          const imgData = canvas.toDataURL('image/png');
          printWindow.document.write(`<div class="sheet-page">`);
          printWindow.document.write(`<h3>Sheet: ${workbook.SheetNames[i]}</h3>`);
          printWindow.document.write(`<img src="${imgData}" />`);
          printWindow.document.write('</div>');
        } catch (error) {
          console.error('Error rendering sheet:', error);
        }
      }
    }

    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      onPrint();
    }, 500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Excel Sheets Preview
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Print (Browser)
            </button>
            <button
              onClick={handlePrintAsImage}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Print (Pixel Perfect)
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {workbook.SheetNames.map((name, index) => (
            <button
              key={index}
              onClick={() => setActiveSheetIndex(index)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                activeSheetIndex === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="sheets-wrapper">
        {workbook.SheetNames.map((name, index) => renderSheet(name, index))}
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .sheets-wrapper,
          .sheets-wrapper * {
            visibility: visible;
          }
          .sheets-wrapper {
            position: absolute;
            left: 0;
            top: 0;
          }
          .sheet-container {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}
