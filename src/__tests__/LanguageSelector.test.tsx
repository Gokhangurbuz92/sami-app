import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import LanguageSelector from '../components/LanguageSelector';
import i18n from '../i18n/config';

// Mock de i18n
vi.mock('../i18n/config', () => ({
  default: {
    language: 'fr',
    changeLanguage: vi.fn(),
  },
  getTextDirection: vi.fn(() => 'ltr'),
}));

describe('LanguageSelector', () => {
  it('change de langue correctement', () => {
    render(<LanguageSelector />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'ar' } });
    expect(i18n.changeLanguage).toHaveBeenCalledWith('ar');
  });

  it('affiche les langues disponibles', () => {
    render(<LanguageSelector />);
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('العربية')).toBeInTheDocument();
  });
}); 