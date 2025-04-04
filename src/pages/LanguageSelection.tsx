import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const LanguageSelection = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' }
  ];

  const handleLanguageSelect = (langCode: string) => {
    i18n.changeLanguage(langCode);
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl mb-8">Choisissez votre langue / Select your language / اختر لغتك</h1>
      <div className="grid gap-4">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageSelect(lang.code)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelection;
