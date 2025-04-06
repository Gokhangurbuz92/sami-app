import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const EmailVerification: React.FC = () => {
  const { currentUser, checkEmailVerification, sendVerificationEmail, logout } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationCheckCount, setVerificationCheckCount] = useState<number>(0);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Si l'utilisateur a déjà vérifié son email, le rediriger vers le tableau de bord
    if (currentUser.emailVerified) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleCheckVerification = async () => {
    if (!currentUser) return;

    setCheckingStatus(true);
    setError(null);
    setSuccess(null);

    try {
      const isVerified = await checkEmailVerification();
      setVerificationCheckCount(prev => prev + 1);
      
      if (isVerified) {
        setSuccess(t('auth.emailVerifiedSuccess'));
        // Rediriger vers le tableau de bord après 2 secondes
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        // Si nous avons vérifié plus de 3 fois sans succès, suggérer d'envoyer un nouvel email
        if (verificationCheckCount >= 3) {
          setError(t('auth.verificationNotFound'));
        } else {
          setError(t('auth.emailNotVerifiedYet'));
        }
      }
    } catch (err) {
      console.error("Erreur lors de la vérification de l'email:", err);
      setError(t('auth.verificationCheckError'));
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleResendVerification = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await sendVerificationEmail();
      setSuccess(t('auth.verificationEmailSent'));
      setVerificationCheckCount(0);
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'email de vérification:", err);
      setError(t('auth.sendVerificationError'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
    }
  };

  if (!currentUser) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" component="h1" gutterBottom>
            {t('auth.emailVerificationRequired')}
          </Typography>

          <Typography variant="body1" sx={{ mb: 3 }}>
            {t('auth.verificationEmailSentMessage', { email: currentUser.email })}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCheckVerification}
              disabled={checkingStatus}
              fullWidth
            >
              {checkingStatus ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('auth.checkVerificationStatus')
              )}
            </Button>

            <Button
              variant="outlined"
              onClick={handleResendVerification}
              disabled={loading}
              fullWidth
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('auth.resendVerificationEmail')
              )}
            </Button>

            <Button
              variant="text"
              onClick={handleLogout}
              fullWidth
            >
              {t('common.logout')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default EmailVerification; 