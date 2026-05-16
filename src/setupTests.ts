import 'fake-indexeddb/auto';
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock de window.matchMedia para el entorno de prueba (jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false, // default
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock de IntersectionObserver para lazy loading
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock de localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock de Supabase
vi.mock('./supabaseClient', () => {
  const mockSelect = vi.fn(() => ({
    eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
    in: vi.fn(() => Promise.resolve({ data: [], error: null })),
    then: vi.fn((callback) => Promise.resolve({ data: [], error: null }).then(callback)),
  }));

  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: vi.fn(() => Promise.resolve({ data: null, error: null }))
  }));

  return {
    supabase: {
      from: mockFrom,
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null }))
      }
    },
    // Expose the mockSelect for tests to configure
    __setMockSelectData: (data: any) => {
      mockSelect.mockImplementation(() => ({
        eq: vi.fn(() => Promise.resolve({ data, error: null })),
        in: vi.fn(() => Promise.resolve({ data, error: null })),
        then: vi.fn((callback) => Promise.resolve({ data, error: null }).then(callback)),
      }));
    },
  };
});

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isPluginAvailable: () => true,
    getPlatform: () => 'web',
  },
  Plugins: {},
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    writeFile: vi.fn(),
    readFile: vi.fn(),
    deleteFile: vi.fn(),
    mkdir: vi.fn(),
    rmdir: vi.fn(),
    readdir: vi.fn(),
    getUri: vi.fn(),
    stat: vi.fn(),
    rename: vi.fn(),
    copy: vi.fn(),
  },
  Directory: {
    Cache: 'CACHE',
  },
  Encoding: {
    UTF8: 'utf8',
  },
}));
