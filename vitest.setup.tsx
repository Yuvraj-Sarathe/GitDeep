import { beforeAll, afterAll, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
  Image: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const originalError = console.error;

/**
 * Helper to suppress specific, known React warnings in a scoped way.
 *
 * Usage in tests:
 *   const errorSpy = suppressReactConsoleErrors();
 *   // ...run test...
 *   errorSpy.mockRestore();
 */
export function suppressReactConsoleErrors() {
  return vi
    .spyOn(console, 'error')
    .mockImplementation((...args: unknown[]) => {
      const [message] = args;

      if (
        typeof message === 'string' &&
        (
          // Specific ReactDOM.render deprecation warning
          message.startsWith('Warning: ReactDOM.render is no longer supported') ||
          // Specific act(...) warnings
          (message.includes('Warning:') && message.includes('act(...)'))
        )
      ) {
        return;
      }

      // Delegate all other errors to the original console.error
      originalError(...(args as Parameters<typeof console.error>));
    });
}

// Optionally expose helper globally for convenience in test suites
// so tests can call `const spy = suppressReactConsoleErrors();`
(globalThis as any).suppressReactConsoleErrors = suppressReactConsoleErrors;