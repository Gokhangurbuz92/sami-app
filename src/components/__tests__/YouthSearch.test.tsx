/// <reference types="node" />
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/config';
import theme from '../../theme';
import YouthSearch from '../YouthSearch';
import { youthService } from '../../services/youthService';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

interface Youth {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock du service
vi.mock('../../services/youthService', () => ({
  youthService: {
    searchYouth: vi.fn(),
    deleteYouth: vi.fn()
  }
}));

// Mock des traductions
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      console.log('Translation key requested:', key); // Debug log
      const translations: { [key: string]: string } = {
        'youth.searchPlaceholder': 'Rechercher un jeune...',
        'youth.confirmDelete': 'Êtes-vous sûr de vouloir supprimer ce jeune ?',
        'youth.delete': 'Supprimer',
        'common.cancel': 'Annuler',
        'common.delete': 'Supprimer',
        'youth.dob': 'Date de naissance',
        'youth.noResults': 'Aucun résultat'
      };
      const translation = translations[key] || key;
      console.log('Translation returned:', translation); // Debug log
      return translation;
    }
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {}
  },
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children
}));

const mockYouth: Youth[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '2000-01-01',
    createdBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockUser = {
  uid: 'user1',
  email: 'test@example.com'
};

// Mock de useAuth pour simuler un utilisateur connecté
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: mockUser,
    isReferent: true
  })
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </I18nextProvider>
  );
};

describe('YouthSearch Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(youthService.searchYouth).mockResolvedValue(mockYouth);
    console.log('Test starting...'); // Debug log
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('renders search input', () => {
    const { container } = renderWithProviders(<YouthSearch />);
    console.log('Rendered HTML:', container.innerHTML);
    const searchInput = screen.getByRole('textbox', { name: 'youth-search' });
    expect(searchInput).toBeInTheDocument();
  });

  it('displays loading state while searching', async () => {
    let resolvePromise: (value: Youth[]) => void;
    const promise = new Promise<Youth[]>((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(youthService.searchYouth).mockImplementation(() => {
      return promise;
    });

    renderWithProviders(<YouthSearch />);

    const searchInput = screen.getByRole('textbox', { name: 'youth-search' });
    
    await act(async () => {
      fireEvent.change(searchInput, { 
        target: { value: 'John' }
      });
      vi.advanceTimersByTime(600);
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    await act(async () => {
      resolvePromise(mockYouth);
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('displays search results', async () => {
    renderWithProviders(<YouthSearch />);

    const searchInput = screen.getByRole('textbox', { name: 'youth-search' });
    
    await act(async () => {
      fireEvent.change(searchInput, { 
        target: { value: 'John' }
      });
      vi.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('handles delete confirmation', async () => {
    vi.mocked(youthService.deleteYouth).mockResolvedValue(undefined);
    vi.mocked(youthService.searchYouth).mockResolvedValue(mockYouth);

    renderWithProviders(<YouthSearch />);

    const searchInput = screen.getByRole('textbox', { name: 'youth-search' });
    
    await act(async () => {
      fireEvent.change(searchInput, { 
        target: { value: 'John' }
      });
      vi.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText('delete');
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(screen.getByText('Êtes-vous sûr de vouloir supprimer ce jeune ?')).toBeInTheDocument();

    const confirmButton = screen.getByLabelText('confirm delete');
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(youthService.deleteYouth).toHaveBeenCalledWith('1');
  });

  it('handles search errors gracefully', async () => {
    const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(youthService.searchYouth).mockRejectedValue(new Error('Search failed'));

    renderWithProviders(<YouthSearch />);

    const searchInput = screen.getByRole('textbox', { name: 'youth-search' });
    
    await act(async () => {
      fireEvent.change(searchInput, { 
        target: { value: 'John' }
      });
      vi.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalled();
    });

    mockConsoleError.mockRestore();
  });
});
