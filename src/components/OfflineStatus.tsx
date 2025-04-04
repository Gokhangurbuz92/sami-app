import React, { useEffect, useState } from 'react';
import { Snackbar, Alert, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import WifiOffIcon from '@mui/icons-material/WifiOff';

const OfflineStatus: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { t } = useTranslation();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  if (!isOffline) return null;

  return (
    <Snackbar
      open={isOffline}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ top: { xs: 16, sm: 24 } }}
    >
      <Alert
        severity="warning"
        icon={<WifiOffIcon />}
        action={
          <Button color="inherit" size="small" onClick={handleReload}>
            {t('common.retry')}
          </Button>
        }
      >
        {t('common.offline')}
      </Alert>
    </Snackbar>
  );
};

export default React.memo(OfflineStatus);
