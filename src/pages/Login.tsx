import '../i18n/config';
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Link,
  CircularProgress,
  FormHelperText,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [checkingVerification, setCheckingVerification] = useState(false);
  const { signIn, signUp, resetPassword, error, sendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Vérifier si nous arrivons de la page d'inscription avec un paramètre de vérification
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const needVerification = params.get('needVerification');
    const userEmail = params.get('email');
    
    if (needVerification === 'true' && userEmail) {
      setVerificationEmail(userEmail);
      setVerificationDialogOpen(true);
    }
  }, [location]);

  const validateForm = () => {
    if (!email.includes('@') || !email.includes('.')) {
      return t('auth.invalidEmail');
    }
    if (password.length < 6) {
      return t('auth.passwordTooShort');
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, email.split('@')[0], 'jeune');
        // Afficher le dialogue de vérification
        setVerificationEmail(email);
        setVerificationDialogOpen(true);
      } else {
        await signIn(email, password);
        navigate('/');
      }
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.includes('@') || !resetEmail.includes('.')) {
      alert(t('auth.invalidEmail'));
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetEmail);
      alert(t('auth.resetPasswordSuccess'));
      setShowResetPassword(false);
    } catch (err) {
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) return;
    
    setCheckingVerification(true);
    try {
      await sendVerificationEmail();
      alert(t('auth.verificationEmailSent'));
    } catch (err) {
      console.error('Resend verification error:', err);
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleCloseVerificationDialog = () => {
    setVerificationDialogOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <LanguageSelector />
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          mx: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          SAMI
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Dialog de vérification d'email */}
        <Dialog open={verificationDialogOpen} onClose={handleCloseVerificationDialog}>
          <DialogTitle>{t('auth.verifyEmail')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('auth.verificationEmailSentMessage', { email: verificationEmail })}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleResendVerification} 
              color="primary" 
              disabled={checkingVerification}
            >
              {checkingVerification ? (
                <CircularProgress size={24} />
              ) : (
                t('auth.resendVerificationEmail')
              )}
            </Button>
            <Button onClick={handleCloseVerificationDialog} color="primary" autoFocus>
              {t('common.close')}
            </Button>
          </DialogActions>
        </Dialog>

        {showResetPassword ? (
          <form onSubmit={handleResetPassword}>
            <Typography variant="h6" gutterBottom>
              {t('auth.resetPassword')}
            </Typography>
            <TextField
              fullWidth
              label={t('common.email')}
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setShowResetPassword(false)}
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
              <Button fullWidth type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : t('auth.resetPassword')}
              </Button>
            </Stack>
          </form>
        ) : (
          <>
            <Typography variant="h6" gutterBottom align="center">
              {isSignUp ? t('auth.signUpTitle') : t('auth.loginTitle')}
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label={t('common.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
                disabled={loading}
                helperText={t('auth.emailHelper')}
              />
              <TextField
                fullWidth
                label={t('common.password')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                disabled={loading}
                helperText={isSignUp ? t('auth.passwordHelper') : ''}
              />
              <FormHelperText>{isSignUp && t('auth.passwordRequirements')}</FormHelperText>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : isSignUp ? (
                  t('common.signUp')
                ) : (
                  t('common.login')
                )}
              </Button>
            </form>

            <Stack spacing={2} sx={{ mt: 3 }}>
              <Divider />
              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setIsSignUp(!isSignUp)}
                  sx={{ cursor: 'pointer' }}
                >
                  {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.noAccount')}
                </Link>
              </Box>
              {!isSignUp && (
                <Box sx={{ textAlign: 'center' }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => setShowResetPassword(true)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </Box>
              )}
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Login;
