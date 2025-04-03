import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: 'fr' | 'ar') => {
    void i18n.changeLanguage(lng);
  };

  return (
    <div>
      <button type="button" onClick={() => changeLanguage('fr')}>FR</button>
      <button type="button" onClick={() => changeLanguage('ar')}>AR</button>
    </div>
  );
};

export default LanguageSwitcher; 