import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import YouthSearch from '../YouthSearch';
import { youthService } from '../../services/youthService';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock du service
vi.mock('../../services/youthService');

// Mock des traductions
vi.mock('react-i18next', async () => {
  const actual = await vi.importActual('react-i18next');
  return {
    ...actual,
    // Mock des fonctions nécessaires
    useTranslation: () => ({
      t: (key: string) => key
    }),
    initReactI18next: {
      type: '3rdParty',
      init: () => {}
    }
  };
});

const mockYouth = [
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
  }),
  AuthContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children
  }
}));

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
        <YouthSearch />
      </ThemeProvider>
    );

    expect(screen.getByPlaceholderText('youth.searchPlaceholder')).toBeInTheDocument();
  });

  it('displays loading state while searching', async () => {
    // Ralentir la résolution de la promesse pour avoir le temps de voir le loader
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(youthService.searchYouth).mockImplementation(() => {
      return promise as Promise<any>;
    });

    render(
      <ThemeProvider theme={theme}>
        <YouthSearch />
      </ThemeProvider>
    );

    const searchInput = screen.getByPlaceholderText('youth.searchPlaceholder');
    
    // Utiliser act pour la mise à jour d'état
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'John' } });
      // Attendre que le debounce se déclenche
      await new Promise(r => setTimeout(r, 600));
    });

    // Maintenant le spinner devrait être visible
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Résoudre la promesse pour terminer la recherche
    await act(async () => {
      resolvePromise(mockYouth);
    });

    // Vérifier que le spinner a disparu
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('displays search results', async () => {
    render(
      <ThemeProvider theme={theme}>
        <YouthSearch />
      </ThemeProvider>
    );

    const searchInput = screen.getByPlaceholderText('youth.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('handles delete confirmation', async () => {
    // Préparer les mocks
    vi.mocked(youthService.deleteYouth).mockResolvedValue(undefined);
    vi.mocked(youthService.searchYouth).mockResolvedValue(mockYouth);

    render(
      <ThemeProvider theme={theme}>
        <YouthSearch />
      </ThemeProvider>
    );

    const searchInput = screen.getByPlaceholderText('youth.searchPlaceholder');
    
    // Déclencher la recherche avec act
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'John' } });
      // Attendre que le debounce se déclenche
      await new Promise(r => setTimeout(r, 600));
    });

    // Attendre que les résultats apparaissent
    let listItem: HTMLElement;
    await waitFor(() => {
      listItem = screen.getByText((content) => {
        return content.includes('John') && content.includes('Doe');
      });
      expect(listItem).toBeInTheDocument();
    });

    // Maintenant cliquer sur le bouton de suppression
    const deleteButton = screen.getByLabelText('delete');
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Vérifier que la boîte de dialogue est visible
    expect(screen.getByText('youth.confirmDelete')).toBeInTheDocument();

    // Confirmer la suppression
    const confirmButton = screen.getByLabelText('confirm delete');
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    // Vérifier que la méthode de suppression a été appelée
    expect(youthService.deleteYouth).toHaveBeenCalledWith('1');
  });

  it('handles search errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(youthService.searchYouth).mockRejectedValue(new Error('Search failed'));

    render(
      <ThemeProvider theme={theme}>
        <YouthSearch />
      </ThemeProvider>
    );

    const searchInput = screen.getByPlaceholderText('youth.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });
});
