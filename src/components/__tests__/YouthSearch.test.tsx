import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import YouthSearch from '../YouthSearch';
import { youthService } from '../../services/youthService';
import { AuthContext } from '../../contexts/AuthContext';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock du service
vi.mock('../../services/youthService');

// Mock des traductions
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockYouth = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '2000-01-01',
    createdBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockUser = {
  uid: 'user1',
  email: 'test@example.com',
};

describe('YouthSearch Component', () => {
  beforeEach(() => {
    vi.mocked(youthService.searchYouth).mockResolvedValue(mockYouth);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input', () => {
    render(
      <ThemeProvider theme={theme}>
        <AuthContext.Provider value={{ user: mockUser }}>
          <YouthSearch />
        </AuthContext.Provider>
      </ThemeProvider>
    );

    expect(screen.getByPlaceholderText('youth.searchPlaceholder')).toBeInTheDocument();
  });

  it('displays loading state while searching', async () => {
    render(
      <ThemeProvider theme={theme}>
        <AuthContext.Provider value={{ user: mockUser }}>
          <YouthSearch />
        </AuthContext.Provider>
      </ThemeProvider>
    );

    const searchInput = screen.getByPlaceholderText('youth.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await vi.waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('displays search results', async () => {
    render(
      <ThemeProvider theme={theme}>
        <AuthContext.Provider value={{ user: mockUser }}>
          <YouthSearch />
        </AuthContext.Provider>
      </ThemeProvider>
    );

    const searchInput = screen.getByPlaceholderText('youth.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await vi.waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('handles delete confirmation', async () => {
    vi.mocked(youthService.deleteYouth).mockResolvedValue(undefined);

    render(
      <ThemeProvider theme={theme}>
        <AuthContext.Provider value={{ user: mockUser }}>
          <YouthSearch />
        </AuthContext.Provider>
      </ThemeProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText('delete');
    fireEvent.click(deleteButton);

    expect(screen.getByText('youth.confirmDelete')).toBeInTheDocument();

    const confirmButton = screen.getByLabelText('confirm delete');
    fireEvent.click(confirmButton);

    await vi.waitFor(() => {
      expect(youthService.deleteYouth).toHaveBeenCalledWith('1');
    });
  });

  it('handles search errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(youthService.searchYouth).mockRejectedValue(new Error('Search failed'));

    render(
      <ThemeProvider theme={theme}>
        <AuthContext.Provider value={{ user: mockUser }}>
          <YouthSearch />
        </AuthContext.Provider>
      </ThemeProvider>
    );

    const searchInput = screen.getByPlaceholderText('youth.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await vi.waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });
}); 