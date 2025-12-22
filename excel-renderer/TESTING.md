# Testing Guide

## Overview

This project uses **Jest** and **React Testing Library (RTL)** for comprehensive unit and integration testing. The test suite covers all major components, API routes, and utility functions with a focus on functionality, accessibility, security, and error handling.

## Testing Stack

- **Jest 30** - Testing framework with built-in mocking and assertions
- **React Testing Library 16** - React component testing utilities
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom Jest matchers for DOM assertions
- **jest-environment-jsdom** - Browser-like environment for component testing

## Test Coverage

### Components (`app/components/__tests__/`)

#### ExcelUploader.test.tsx
Comprehensive tests for the Excel file upload component:
- ✅ Rendering and accessibility (ARIA labels, keyboard navigation)
- ✅ File input triggering and validation
- ✅ File type validation (.xlsx, .xls, .xlsm)
- ✅ Valid file processing and workbook loading
- ✅ Invalid file rejection with user feedback
- ✅ Error handling for file reading failures
- ✅ Application Insights event tracking
- ✅ Performance metrics tracking

**Test Cases**: 13 tests covering all user interactions and edge cases

#### SheetRenderer.test.tsx
Comprehensive tests for the sheet rendering and printing component:
- ✅ Sheet tab rendering for multiple sheets
- ✅ Active sheet content display
- ✅ Sheet navigation and tab switching
- ✅ Browser print functionality
- ✅ Pixel-perfect print with html2canvas
- ✅ Print error handling
- ✅ Cell styling (colors, fonts, borders)
- ✅ Formula rendering
- ✅ Empty cell handling
- ✅ ARIA attributes for tabs
- ✅ Keyboard accessibility
- ✅ Special characters in sheet names
- ✅ Semantic HTML structure

**Test Cases**: 19 tests covering rendering, user interactions, and accessibility

### API Routes (`app/api/files/__tests__/`)

#### route.test.ts
Comprehensive tests for the file storage API:
- ✅ POST: File upload with validation
- ✅ POST: Multiple file format support (.xlsx, .xls, .xlsm, .csv, .pdf)
- ✅ POST: File size limits (50MB)
- ✅ POST: Filename sanitization (path traversal prevention)
- ✅ POST: Base64 encoding
- ✅ GET: File retrieval by filename
- ✅ GET: Error handling for missing/non-existent files
- ✅ DELETE: File deletion
- ✅ DELETE: Error handling
- ✅ Security: Path traversal attack prevention
- ✅ Security: Special character sanitization
- ✅ Error handling: Generic error messages (no information disclosure)

**Test Cases**: 25+ tests covering all API endpoints and security scenarios

### Utilities (`lib/__tests__/`)

#### appInsights.client.test.ts
Tests for Application Insights telemetry client:
- ✅ Event tracking with properties
- ✅ Exception tracking
- ✅ Metric tracking (positive, zero, negative values)
- ✅ Integration scenarios

**Test Cases**: 15 tests covering all telemetry functions

## Running Tests

### Run All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### CI Mode (for continuous integration)
```bash
npm run test:ci
```

## Test Configuration

### jest.config.js
- **Test Environment**: jsdom (browser-like environment)
- **Setup Files**: jest.setup.js (global mocks and configuration)
- **Module Name Mapper**: Resolves `@/` imports to root directory
- **Coverage Thresholds**: 70% for branches, functions, lines, and statements
- **Test Match Patterns**: `**/__tests__/**/*.[jt]s?(x)`, `**/?(*.)+(spec|test).[jt]s?(x)`

### jest.setup.js
Global test setup including:
- Application Insights mocks
- html2canvas mock
- window.print() mock
- window.matchMedia() mock
- FileReader mock

## Mocking Strategy

### Application Insights
All Application Insights functions are mocked to prevent actual telemetry during tests:
```typescript
jest.mock('@/lib/appInsights.client', () => ({
  trackEvent: jest.fn(),
  trackException: jest.fn(),
  trackMetric: jest.fn(),
  getAppInsights: jest.fn(() => null),
}));
```

### html2canvas
Mocked to return a mock canvas object:
```typescript
jest.mock('html2canvas', () => {
  return jest.fn(() => Promise.resolve({
    toDataURL: () => 'data:image/png;base64,mock',
    style: {},
  }));
});
```

### window.print()
Mocked globally to prevent actual print dialogs:
```typescript
global.print = jest.fn();
```

## Testing Best Practices

### 1. Accessibility Testing
All component tests verify:
- ARIA attributes (role, aria-label, aria-selected, etc.)
- Keyboard navigation (tab, enter, space keys)
- Focus management
- Semantic HTML structure

### 2. User Interaction Testing
Uses `@testing-library/user-event` for realistic user interactions:
```typescript
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'text');
await user.tab();
```

### 3. Async Testing
Uses `waitFor` for async operations:
```typescript
await waitFor(() => {
  expect(mockFunction).toHaveBeenCalled();
});
```

### 4. Error Handling
Tests verify both success and error scenarios:
- Happy path (successful operations)
- Edge cases (empty inputs, boundary values)
- Error conditions (network failures, invalid data)
- Error messages (user-friendly, no sensitive data)

### 5. Security Testing
API tests verify:
- Input validation
- Path traversal prevention
- Filename sanitization
- File size limits
- MIME type validation

## Coverage Reports

After running `npm run test:coverage`, view the coverage report:
- **Terminal**: Summary displayed in console
- **HTML Report**: Open `coverage/lcov-report/index.html` in browser

### Coverage Thresholds
The project maintains 70% minimum coverage for:
- **Branches**: Conditional logic paths
- **Functions**: Function execution
- **Lines**: Code line execution
- **Statements**: Statement execution

## Continuous Integration

The `test:ci` script is optimized for CI environments:
- Runs in non-interactive mode (`--ci`)
- Generates coverage reports
- Uses limited workers for memory efficiency (`--maxWorkers=2`)

### Example CI Configuration (GitHub Actions)
```yaml
- name: Run tests
  run: npm run test:ci
  
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Writing New Tests

### Component Test Template
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<YourComponent />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockFunction).toHaveBeenCalled();
    });
  });
});
```

### API Test Template
```typescript
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

describe('API Route', () => {
  it('handles GET request', async () => {
    const request = new NextRequest('http://localhost:3000/api/endpoint');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual(expectedData);
  });
});
```

## Debugging Tests

### Run Single Test File
```bash
npm test -- ExcelUploader.test.tsx
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="handles file upload"
```

### Verbose Output
```bash
npm test -- --verbose
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Test Maintenance

### Update Snapshots (if using)
```bash
npm test -- -u
```

### Clear Jest Cache
```bash
npx jest --clearCache
```

### Check for Outdated Dependencies
```bash
npm outdated
```

## Known Issues & Limitations

### Next.js Image Component
The Next.js `<Image>` component requires additional mocking in tests. If testing components with images, add to jest.setup.js:
```typescript
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));
```

### Application Insights
Actual Application Insights connections are mocked in tests. For integration testing with real telemetry, use separate end-to-end tests.

### File Upload Testing
Browser file upload behavior is mocked. Real file upload testing requires end-to-end tests with tools like Playwright or Cypress.

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Playground](https://testing-playground.com/)
- [Common Mistakes with RTL](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom#custom-matchers)

## Maintenance Schedule

- **Weekly**: Run full test suite with coverage
- **Monthly**: Review and update test coverage thresholds
- **Quarterly**: Audit test quality and remove redundant tests
- **Per Release**: Ensure all tests pass before deployment

## Support

For questions or issues with tests:
1. Check this documentation
2. Review existing test files for examples
3. Consult official documentation for Jest and RTL
4. Create an issue in the project repository
