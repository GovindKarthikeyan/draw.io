import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExcelUploader from '../ExcelUploader';
import * as XLSX from 'xlsx';
import { trackEvent, trackException, trackMetric } from '@/lib/appInsights.client';

// Mock the Application Insights module
jest.mock('@/lib/appInsights.client');

describe('ExcelUploader Component', () => {
  const mockOnFileLoaded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the upload button', () => {
    render(<ExcelUploader onFileLoaded={mockOnFileLoaded} />);
    
    const button = screen.getByRole('button', { name: /click to choose an excel file/i });
    expect(button).toBeInTheDocument();
  });

  it('renders with correct ARIA labels', () => {
    render(<ExcelUploader onFileLoaded={mockOnFileLoaded} />);
    
    const button = screen.getByRole('button', { name: /click to choose an excel file/i });
    expect(button).toHaveAttribute('aria-label', 'Click to choose an Excel file');
  });

  it('triggers file input when button is clicked', async () => {
    const user = userEvent.setup();
    render(<ExcelUploader onFileLoaded={mockOnFileLoaded} />);
    
    const button = screen.getByRole('button', { name: /click to choose an excel file/i });
    const fileInput = screen.getByLabelText(/choose excel file to upload/i);
    
    // Mock the click method
    const clickSpy = jest.spyOn(fileInput, 'click');
    
    await user.click(button);
    
    expect(clickSpy).toHaveBeenCalled();
  });

  it('accepts valid Excel file types', () => {
    render(<ExcelUploader onFileLoaded={mockOnFileLoaded} />);
    
    const fileInput = screen.getByLabelText(/choose excel file to upload/i) as HTMLInputElement;
    expect(fileInput).toHaveAttribute('accept');
    expect(fileInput.accept).toContain('.xlsx');
  });

  it('tracks upload attempt event', async () => {
    render(<ExcelUploader onFileLoaded={mockOnFileLoaded} />);
    
    const fileInput = screen.getByLabelText(/choose excel file to upload/i);
    const file = new File(['dummy content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Create a mock workbook
    const mockWorkbook: XLSX.WorkBook = {
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {
          A1: { t: 's', v: 'Test' },
        },
      },
    };

    // Mock XLSX.read to return our mock workbook
    jest.spyOn(XLSX, 'read').mockReturnValue(mockWorkbook);

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith('ExcelFileUploadAttempt', expect.objectContaining({
        fileName: 'test.xlsx',
        fileSize: expect.any(Number),
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }));
    });
  });

  it('validates file type and rejects invalid files', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<ExcelUploader onFileLoaded={mockOnFileLoaded} />);
    
    const fileInput = screen.getByLabelText(/choose excel file to upload/i);
    const invalidFile = new File(['dummy content'], 'test.txt', {
      type: 'text/plain',
    });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Please select a valid Excel file (.xlsx, .xls, .xlsm)'
      );
      expect(trackEvent).toHaveBeenCalledWith('ExcelFileUploadFailed', expect.objectContaining({
        fileName: 'test.txt',
        reason: 'Invalid file type',
      }));
    });

    alertSpy.mockRestore();
  });

  it('processes valid Excel file and calls onFileLoaded', async () => {
    render(<ExcelUploader onFileLoaded={mockOnFileLoaded} />);
    
    const fileInput = screen.getByLabelText(/choose excel file to upload/i);
    const file = new File(['dummy content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const mockWorkbook: XLSX.WorkBook = {
      SheetNames: ['Sheet1', 'Sheet2'],
      Sheets: {
        Sheet1: {
          A1: { t: 's', v: 'Test' },
        },
        Sheet2: {
          B2: { t: 'n', v: 42 },
        },
      },
    };

    jest.spyOn(XLSX, 'read').mockReturnValue(mockWorkbook);

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnFileLoaded).toHaveBeenCalledWith(mockWorkbook);
      expect(trackEvent).toHaveBeenCalledWith('ExcelFileUploadSuccess', expect.objectContaining({
        fileName: 'test.xlsx',
        sheetCount: 2,
      }));
      expect(trackEvent).toHaveBeenCalledWith('WorkbookLoaded', expect.objectContaining({
        sheetCount: 2,
        sheetNames: ['Sheet1', 'Sheet2'],
      }));
      expect(trackMetric).toHaveBeenCalledWith('ExcelFileLoadTime', expect.any(Number));
    });
  });

  it('handles file reading errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<ExcelUploader onFileLoaded={mockOnFileLoaded} />);
    
    const fileInput = screen.getByLabelText(/choose excel file to upload/i);
    const file = new File(['dummy content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    jest.spyOn(XLSX, 'read').mockImplementation(() => {
      throw new Error('Failed to parse Excel file');
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error reading Excel file. Please try again.');
      expect(trackException).toHaveBeenCalled();
      expect(trackEvent).toHaveBeenCalledWith('ExcelFileUploadFailed', expect.objectContaining({
        fileName: 'test.xlsx',
        reason: 'Parse error',
      }));
    });

    consoleErrorSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('handles .xls file extension', async () => {
    render(<ExcelUploader onFileLoaded={mockOnFileLoaded} />);
    
    const fileInput = screen.getByLabelText(/choose excel file to upload/i);
    const file = new File(['dummy content'], 'test.xls', {
      type: 'application/vnd.ms-excel',
    });

    const mockWorkbook: XLSX.WorkBook = {
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {
          A1: { t: 's', v: 'Test' },
        },
      },
    };

    jest.spyOn(XLSX, 'read').mockReturnValue(mockWorkbook);

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnFileLoaded).toHaveBeenCalledWith(mockWorkbook);
    });
  });

  it('handles .xlsm file extension', async () => {
    render(<ExcelUploader onFileLoaded={mockOnFileLoaded} />);
    
    const fileInput = screen.getByLabelText(/choose excel file to upload/i);
    const file = new File(['dummy content'], 'test.xlsm', {
      type: 'application/vnd.ms-excel.sheet.macroEnabled.12',
    });

    const mockWorkbook: XLSX.WorkBook = {
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {
          A1: { t: 's', v: 'Test' },
        },
      },
    };

    jest.spyOn(XLSX, 'read').mockReturnValue(mockWorkbook);

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnFileLoaded).toHaveBeenCalledWith(mockWorkbook);
    });
  });

  it('does not process when no file is selected', () => {
    render(<ExcelUploader onFileLoaded={mockOnFileLoaded} />);
    
    const fileInput = screen.getByLabelText(/choose excel file to upload/i);
    
    fireEvent.change(fileInput, { target: { files: [] } });
    
    expect(mockOnFileLoaded).not.toHaveBeenCalled();
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<ExcelUploader onFileLoaded={mockOnFileLoaded} />);
    
    const button = screen.getByRole('button', { name: /click to choose an excel file/i });
    
    // Focus on the button using tab
    await user.tab();
    expect(button).toHaveFocus();
    
    // Button should be activatable with Enter or Space
    expect(button).toHaveAttribute('type', 'button');
  });
});
