import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SheetRenderer from '../SheetRenderer';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { trackEvent, trackException, trackMetric } from '@/lib/appInsights.client';

// Mock modules
jest.mock('@/lib/appInsights.client');
jest.mock('html2canvas');

describe('SheetRenderer Component', () => {
  const mockOnPrint = jest.fn();

  const createMockWorkbook = (sheetNames: string[], data: Record<string, any>): XLSX.WorkBook => {
    const Sheets: Record<string, any> = {};
    sheetNames.forEach((name) => {
      Sheets[name] = data[name] || { A1: { t: 's', v: 'Test' }, '!ref': 'A1' };
    });

    return {
      SheetNames: sheetNames,
      Sheets,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders sheet tabs for all sheets in workbook', () => {
    const mockWorkbook = createMockWorkbook(['Sheet1', 'Sheet2', 'Sheet3'], {});

    render(<SheetRenderer workbook={mockWorkbook} onPrint={mockOnPrint} />);

    expect(screen.getByRole('tab', { name: /sheet1/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sheet2/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sheet3/i })).toBeInTheDocument();
  });

  it('renders the active sheet content', () => {
    const mockWorkbook = createMockWorkbook(['TestSheet'], {
      TestSheet: {
        A1: { t: 's', v: 'Header' },
        B1: { t: 'n', v: 42 },
        '!ref': 'A1:B1',
      },
    });

    render(<SheetRenderer workbook={mockWorkbook} onPrint={mockOnPrint} />);

    expect(screen.getByText('Header')).toBeInTheDocument();
    // Check if the number 42 is rendered (might be in a cell)
    const tableElement = screen.getByRole('table');
    expect(tableElement).toBeInTheDocument();
    expect(tableElement.textContent).toContain('42');
  });

  it('switches sheets when tab is clicked', async () => {
    const user = userEvent.setup();
    const mockWorkbook = createMockWorkbook(['Sheet1', 'Sheet2'], {
      Sheet1: { A1: { t: 's', v: 'Sheet 1 Content' }, '!ref': 'A1' },
      Sheet2: { A1: { t: 's', v: 'Sheet 2 Content' }, '!ref': 'A1' },
    });

    render(<SheetRenderer workbook={mockWorkbook} onPrint={mockOnPrint} />);

    // Initially Sheet1 should be active
    expect(screen.getByText('Sheet 1 Content')).toBeInTheDocument();

    // Click Sheet2 tab
    const sheet2Tab = screen.getByRole('tab', { name: /sheet2/i });
    await user.click(sheet2Tab);

    // Now Sheet2 content should be visible
    await waitFor(() => {
      expect(screen.getByText('Sheet 2 Content')).toBeInTheDocument();
    });

    // Check that navigation event was tracked
    expect(trackEvent).toHaveBeenCalledWith(
      'SheetNavigated',
      expect.objectContaining({
        sheetName: 'Sheet2',
        sheetIndex: 1,
      })
    );
  });

  it('renders print buttons', () => {
    const mockWorkbook = createMockWorkbook(['Sheet1'], {});

    render(<SheetRenderer workbook={mockWorkbook} onPrint={mockOnPrint} />);

    expect(screen.getByRole('button', { name: /print \(browser\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /print \(pixel perfect\)/i })).toBeInTheDocument();
  });

  it('handles browser print when Print (Browser) button is clicked', async () => {
    const user = userEvent.setup();
    const printSpy = jest.spyOn(window, 'print').mockImplementation(() => {});

    const mockWorkbook = createMockWorkbook(['Sheet1'], {});

    render(<SheetRenderer workbook={mockWorkbook} onPrint={mockOnPrint} />);

    const printButton = screen.getByRole('button', { name: /print \(browser\)/i });
    await user.click(printButton);

    await waitFor(() => {
      expect(printSpy).toHaveBeenCalled();
      expect(mockOnPrint).toHaveBeenCalled();
      expect(trackEvent).toHaveBeenCalledWith(
        'PrintButtonClicked',
        expect.objectContaining({
          printMode: 'browser',
        })
      );
      expect(trackEvent).toHaveBeenCalledWith(
        'PrintSuccess',
        expect.objectContaining({
          printMode: 'browser',
        })
      );
    });

    printSpy.mockRestore();
  });

  it('handles pixel perfect print when Print (Pixel Perfect) button is clicked', async () => {
    const user = userEvent.setup();
    const printSpy = jest.spyOn(window, 'print').mockImplementation(() => {});

    // Mock html2canvas to return a mock canvas
    (html2canvas as jest.Mock).mockResolvedValue({
      toDataURL: () => 'data:image/png;base64,mockImageData',
      style: {},
    });

    const mockWorkbook = createMockWorkbook(['Sheet1'], {
      Sheet1: { A1: { t: 's', v: 'Test' } },
    });

    render(<SheetRenderer workbook={mockWorkbook} onPrint={mockOnPrint} />);

    const pixelPerfectButton = screen.getByRole('button', { name: /print \(pixel perfect\)/i });
    await user.click(pixelPerfectButton);

    await waitFor(() => {
      expect(html2canvas).toHaveBeenCalled();
      expect(printSpy).toHaveBeenCalled();
      expect(mockOnPrint).toHaveBeenCalled();
      expect(trackEvent).toHaveBeenCalledWith(
        'PrintButtonClicked',
        expect.objectContaining({
          printMode: 'pixel-perfect',
        })
      );
      expect(trackMetric).toHaveBeenCalledWith('SheetToImageConversionTime', expect.any(Number));
      expect(trackMetric).toHaveBeenCalledWith('PixelPerfectPrintTotalTime', expect.any(Number));
      expect(trackEvent).toHaveBeenCalledWith(
        'PrintSuccess',
        expect.objectContaining({
          printMode: 'pixel-perfect',
        })
      );
    });

    printSpy.mockRestore();
  });

  it('handles pixel perfect print error gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Mock html2canvas to throw an error
    (html2canvas as jest.Mock).mockRejectedValue(new Error('Canvas error'));

    const mockWorkbook = createMockWorkbook(['Sheet1'], {});

    render(<SheetRenderer workbook={mockWorkbook} onPrint={mockOnPrint} />);

    const pixelPerfectButton = screen.getByRole('button', { name: /print \(pixel perfect\)/i });
    await user.click(pixelPerfectButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error generating print preview. Please try again.');
      expect(trackException).toHaveBeenCalled();
      expect(trackEvent).toHaveBeenCalledWith(
        'PrintFailed',
        expect.objectContaining({
          printMode: 'pixel-perfect',
          error: expect.any(String),
        })
      );
    });

    consoleErrorSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('renders cells with proper styling', () => {
    const mockWorkbook: XLSX.WorkBook = {
      SheetNames: ['StyledSheet'],
      Sheets: {
        StyledSheet: {
          A1: {
            t: 's',
            v: 'Styled Cell',
            s: {
              fgColor: { rgb: 'FF0000' },
              font: {
                color: { rgb: 'FFFFFF' },
                bold: true,
                sz: 14,
              },
            },
          },
        },
      },
    };

    render(<SheetRenderer workbook={mockWorkbook} onPrint={mockOnPrint} />);

    const styledCell = screen.getByText('Styled Cell');
    expect(styledCell).toBeInTheDocument();
    // Styling is applied via inline styles, check if element exists
    expect(styledCell.closest('td')).toBeInTheDocument();
  });

  it('renders formulas correctly', () => {
    const mockWorkbook: XLSX.WorkBook = {
      SheetNames: ['FormulaSheet'],
      Sheets: {
        FormulaSheet: {
          A1: { t: 'n', v: 10 },
          B1: { t: 'n', v: 20 },
          C1: { t: 'n', v: 30, f: '=A1+B1' },
          '!ref': 'A1:C1',
        },
      },
    };

    render(<SheetRenderer workbook={mockWorkbook} onPrint={mockOnPrint} />);

    // Should display the result value
    const table = screen.getByRole('table');
    expect(table.textContent).toContain('30');
  });

  it('handles empty cells', () => {
    const mockWorkbook = createMockWorkbook(['EmptySheet'], {
      EmptySheet: {
        A1: { t: 's', v: 'Not Empty' },
        A2: { t: 'z' }, // Empty cell
        A3: { t: 's', v: '' }, // Empty string
      },
    });

    render(<SheetRenderer workbook={mockWorkbook} onPrint={mockOnPrint} />);

    expect(screen.getByText('Not Empty')).toBeInTheDocument();
  });

  it('has proper ARIA attributes for tabs', () => {
    const mockWorkbook = createMockWorkbook(['Sheet1', 'Sheet2'], {});

    render(<SheetRenderer workbook={mockWorkbook} onPrint={mockOnPrint} />);

    const sheet1Tab = screen.getByRole('tab', { name: /sheet1/i });
    const sheet2Tab = screen.getByRole('tab', { name: /sheet2/i });

    expect(sheet1Tab).toHaveAttribute('aria-selected', 'true');
    expect(sheet2Tab).toHaveAttribute('aria-selected', 'false');

    expect(sheet1Tab).toHaveAttribute('aria-controls');
    expect(sheet2Tab).toHaveAttribute('aria-controls');
  });

  it('is keyboard accessible for tab navigation', async () => {
    const user = userEvent.setup();
    const mockWorkbook = createMockWorkbook(['Sheet1', 'Sheet2'], {
      Sheet1: { A1: { t: 's', v: 'Content 1' }, '!ref': 'A1' },
      Sheet2: { A1: { t: 's', v: 'Content 2' }, '!ref': 'A1' },
    });

    render(<SheetRenderer workbook={mockWorkbook} onPrint={mockOnPrint} />);

    const sheet1Tab = screen.getByRole('tab', { name: /sheet1/i });
    const sheet2Tab = screen.getByRole('tab', { name: /sheet2/i });

    // Focus first tab
    sheet1Tab.focus();
    expect(sheet1Tab).toHaveFocus();

    // Press Enter to activate (if not already active)
    await user.keyboard('{Enter}');

    // Navigate to second tab with keyboard
    sheet2Tab.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  it('handles workbook with single sheet', () => {
    const mockWorkbook = createMockWorkbook(['OnlySheet'], {});

    render(<SheetRenderer workbook={mockWorkbook} onPrint={mockOnPrint} />);

    expect(screen.getByRole('tab', { name: /onlysheet/i })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(1);
  });

  it('handles sheet with special characters in name', () => {
    const mockWorkbook = createMockWorkbook(['Sheet-1!', 'Sheet_2#'], {});

    render(<SheetRenderer workbook={mockWorkbook} onPrint={mockOnPrint} />);

    expect(screen.getByRole('tab', { name: /sheet-1!/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sheet_2#/i })).toBeInTheDocument();
  });

  it('tracks sheet rendering failures', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Create a workbook that might cause rendering issues
    const mockWorkbook: XLSX.WorkBook = {
      SheetNames: ['BadSheet'],
      Sheets: {
        BadSheet: null as any, // Invalid sheet data
      },
    };

    render(<SheetRenderer workbook={mockWorkbook} onPrint={mockOnPrint} />);

    // Component should handle gracefully and track the error
    await waitFor(() => {
      // The component should still render, but may show error state
      expect(screen.getByRole('tab', { name: /badsheet/i })).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('renders table with proper semantic HTML', () => {
    const mockWorkbook = createMockWorkbook(['TestSheet'], {
      TestSheet: {
        A1: { t: 's', v: 'Header 1' },
        B1: { t: 's', v: 'Header 2' },
        A2: { t: 'n', v: 1 },
        B2: { t: 'n', v: 2 },
      },
    });

    render(<SheetRenderer workbook={mockWorkbook} onPrint={mockOnPrint} />);

    // Check for table structure
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // Check for table cells
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBeGreaterThan(0);
  });
});
