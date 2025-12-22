// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Application Insights to avoid errors in tests
jest.mock('@/lib/appInsights.client', () => ({
  trackEvent: jest.fn(),
  trackException: jest.fn(),
  trackMetric: jest.fn(),
  getAppInsights: jest.fn(() => null),
}));

jest.mock('@/lib/appInsights.server', () => ({
  trackEvent: jest.fn(),
  trackException: jest.fn(),
  trackMetric: jest.fn(),
  logInfo: jest.fn(),
  logError: jest.fn(),
  logWarning: jest.fn(),
}));

// Mock html2canvas
jest.mock('html2canvas', () => {
  return jest.fn(() => Promise.resolve({
    toDataURL: () => 'data:image/png;base64,mock',
    style: {},
  }));
});

// Mock window.print
global.print = jest.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock FileReader
class MockFileReader {
  onload = null;
  onerror = null;
  result = null;
  
  readAsArrayBuffer(blob) {
    setTimeout(() => {
      this.result = new ArrayBuffer(8);
      if (this.onload) {
        this.onload({ target: { result: this.result } });
      }
    }, 0);
  }
  
  readAsDataURL(blob) {
    setTimeout(() => {
      this.result = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,mock';
      if (this.onload) {
        this.onload({ target: { result: this.result } });
      }
    }, 0);
  }
}

global.FileReader = MockFileReader;

// Mock Next.js server components for API route testing
if (typeof globalThis.Request === 'undefined') {
  globalThis.Request = class Request {};
  globalThis.Response = class Response {};
  globalThis.Headers = class Headers {};
  globalThis.FormData = class FormData {
    constructor() {
      this.data = new Map();
    }
    append(key, value) {
      this.data.set(key, value);
    }
    get(key) {
      return this.data.get(key);
    }
  };
  globalThis.File = class File extends Blob {
    constructor(bits, name, options) {
      super(bits, options);
      this.name = name;
      this.lastModified = Date.now();
    }
  };
}
