import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import Dashboard from '../pages/Dashboard';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';

// Mock du hook useAuth
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      uid: 'jeune123',
      email: 'jeune@example.com'
    },
    isJeune: true,
    isReferent: false
  }),
}));

// Mocks nécessaires pour les composants qui utilisent des fonctionnalités de routage
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock des services
vi.mock('../services/userService', () => ({
  userService: {
    getUserById: () => Promise.resolve({
      uid: 'jeune123',
      role: 'jeune',
      assignedReferents: ['ref123']
    })
  }
}));

vi.mock('../services/referents', () => ({
  fetchReferents: () => Promise.resolve([
    {
      uid: 'ref123',
      displayName: 'Référent Test',
      email: 'referent@example.com',
      role: 'referent'
    }
  ])
}));

vi.mock('../services/getOrCreateConversation', () => ({
  getOrCreateConversation: () => Promise.resolve('conversation-id')
}));

// Mock de i18n
vi.mock('react-i18next', async () => {
  const actual = await vi.importActual('react-i18next');
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key, // Renvoie la clé comme traduction
      i18n: {
        changeLanguage: vi.fn(),
      },
    }),
  };
});

describe('Dashboard', () => {
  it('affiche le titre du dashboard', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Dashboard />
      </I18nextProvider>
    );

    // Vérifier que le titre est présent
    expect(screen.getByText('dashboard.title')).toBeInTheDocument();
  });

  it('affiche le bouton pour contacter le référent pour un jeune', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Dashboard />
      </I18nextProvider>
    );

    // Attendre que le bouton apparaisse (après le chargement des référents)
    await waitFor(() => {
      expect(screen.getByText('dashboard.referents.contact')).toBeInTheDocument();
    });
  });
  
  it('affiche les widgets principaux du tableau de bord', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Dashboard />
      </I18nextProvider>
    );

    // Vérifier les titres des widgets
    expect(screen.getByText('dashboard.upcomingEvents')).toBeInTheDocument();
    expect(screen.getByText('dashboard.unreadMessages')).toBeInTheDocument();
    expect(screen.getByText('dashboard.recentNotes')).toBeInTheDocument();
    expect(screen.getByText('dashboard.importantNotifications')).toBeInTheDocument();
    
    // Vérifier les messages d'absence de contenu
    expect(screen.getByText('dashboard.noUpcomingEvents')).toBeInTheDocument();
    expect(screen.getByText('dashboard.noUnreadMessages')).toBeInTheDocument();
    expect(screen.getByText('dashboard.noRecentNotes')).toBeInTheDocument();
    expect(screen.getByText('dashboard.noImportantNotifications')).toBeInTheDocument();
  });
}); 