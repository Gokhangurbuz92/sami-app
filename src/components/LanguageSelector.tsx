import React, { useEffect } from 'react';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import i18n, { getTextDirection } from '../i18n/config';
import { SelectChangeEvent } from '@mui/material/Select';

const languages = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'ps', label: 'پښتو' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'so', label: 'Soomaali' },
  { code: 'bn', label: 'বাংলা' }
];

const LanguageSelector: React.FC = () => {
  const currentLang = i18n.language || 'fr';

  useEffect(() => {
    const direction = getTextDirection(currentLang);
    document.documentElement.dir = direction;
  }, [currentLang]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
    document.documentElement.dir = getTextDirection(newLang);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel id="lang-label">Langue</InputLabel>
      <Select
        labelId="lang-label"
        id="lang-select"
        value={currentLang}
        label="Langue"
        onChange={handleChange}
      >
        {languages.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            {lang.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
