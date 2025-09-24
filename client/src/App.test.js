import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the main page with job search form', () => {
  render(<App />);
  const headingElement = screen.getByText(/Job Search/i);
  expect(headingElement).toBeInTheDocument();
});
