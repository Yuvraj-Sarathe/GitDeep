import { render, screen } from '@testing-library/react';
import Home from './page';
import { suppressReactConsoleErrors } from '@/vitest.setup';

describe('Home Page', () => {
  let errorSpy: ReturnType<typeof suppressReactConsoleErrors>;

  beforeEach(() => {
    errorSpy = suppressReactConsoleErrors();
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('renders without crashing', () => {
    render(<Home />);
    expect(screen.getByText(/GitDeep/i)).toBeInTheDocument();
  });

  it('has main heading', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});