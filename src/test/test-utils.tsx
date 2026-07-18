import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

export function renderWithProviders(ui: ReactNode) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}
