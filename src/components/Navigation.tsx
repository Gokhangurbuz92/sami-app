import React from 'react';
import { useTranslation } from 'react-i18next';
import { Message as MessageIcon } from '@mui/icons-material';
import { Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';

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
    <Box component="nav">
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} button>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Navigation;
