import { useTranslation } from 'react-i18next';
import { 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  SelectChangeEvent
} from '@mui/material';

const languages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
  { code: 'ps', name: 'پښتو' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'so', name: 'Soomaali' },
  { code: 'ml', name: 'Mandenkan' },
  { code: 'gn', name: 'Guinéen' },
  { code: 'ci', name: 'Ivoirien' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'ur', name: 'اردو' },
  { code: 'sw', name: 'Kiswahili' },
  { code: 'ti', name: 'ትግርኛ' },
  { code: 'wo', name: 'Wolof' },
  { code: 'yo', name: 'Yorùbá' },
  { code: 'zu', name: 'isiZulu' }
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Langue</InputLabel>
      <Select
        value={i18n.language}
        label="Langue"
        onChange={handleChange}
      >
        {languages.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            {lang.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
} 