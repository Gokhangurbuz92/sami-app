import { createTheme } from '@mui/material/styles';
import i18n from './i18n/config';
import { isRTL } from './i18n/config';

const theme = createTheme({
  direction: isRTL(i18n.language) ? 'rtl' : 'ltr',
  palette: {
    primary: {
      main: '#1976d2'
    },
    secondary: {
      main: '#dc004e'
    },
    background: {
      default: '#F5F6FA',
      paper: '#ffffff'
    },
    text: {
      primary: '#2C3E50',
      secondary: '#7F8C8D'
    },
    error: {
      main: '#E74C3C',
      light: '#F1948A',
      dark: '#C0392B'
    },
    success: {
      main: '#27AE60',
      light: '#58D68D',
      dark: '#1E8449'
    },
    warning: {
      main: '#F1C40F',
      light: '#F4D03F',
      dark: '#D4AC0D'
    },
    info: {
      main: '#3498DB',
      light: '#5DADE2',
      dark: '#2980B9'
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#1B4B82'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#1B4B82'
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#1B4B82'
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#1B4B82'
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#1B4B82'
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#1B4B82'
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    }
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined'
      }
    },
    MuiButton: {
      defaultProps: {
        variant: 'contained'
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px'
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1B4B82',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid rgba(0,0,0,0.1)'
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': {
            backgroundColor: 'rgba(27, 75, 130, 0.08)'
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500
        },
        colorPrimary: {
          backgroundColor: '#1B4B82',
          color: '#ffffff'
        },
        colorSecondary: {
          backgroundColor: '#E67E22',
          color: '#ffffff'
        }
      }
    }
  }
});

export default theme;
