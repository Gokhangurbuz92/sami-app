import React from 'react';
import { useTranslation } from 'react-i18next';
import { Message as MessageIcon } from '@mui/icons-material';

const Navigation: React.FC = () => {
  const { t } = useTranslation();
  
  const menuItems = [
    {
      text: t('messaging.title'),
      icon: <MessageIcon />,
      path: '/messaging'
    }
  ];

  return (
    // ... existing JSX ...
  );
};

export default Navigation; 