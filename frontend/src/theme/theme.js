import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1B4D3E',
      light: '#3D8C72',
      dark: '#003629',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#136B53',
      light: '#A0F0D1',
      dark: '#0A3B2E',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#BA1A1A',
      light: '#FFDAD6',
      dark: '#93000A',
    },
    warning: {
      main: '#D97706',
      light: '#FEF3C7',
      dark: '#92400E',
    },
    success: {
      main: '#166534',
      light: '#E8F7EE',
      dark: '#0F5128',
    },
    background: {
      default: '#F4F8F6',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#121E1A',
      secondary: '#404945',
    },
    divider: 'rgba(27, 77, 62, 0.08)',
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#121E1A' },
    h2: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#121E1A' },
    h3: { fontSize: '1.375rem', fontWeight: 600, letterSpacing: '-0.01em', color: '#121E1A' },
    h4: { fontSize: '1.125rem', fontWeight: 600, color: '#121E1A' },
    h5: { fontSize: '1rem', fontWeight: 600, color: '#121E1A' },
    h6: { fontSize: '0.875rem', fontWeight: 600, color: '#121E1A' },
    body1: { fontSize: '0.9375rem', lineHeight: 1.5, color: '#121E1A' },
    body2: { fontSize: '0.875rem', lineHeight: 1.43, color: '#404945' },
    caption: { fontSize: '0.75rem', lineHeight: 1.33, color: '#526B62' },
    button: { textTransform: 'none', fontWeight: 600, fontFamily: '"Inter", sans-serif' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          textTransform: 'none',
        },
        containedPrimary: {
          backgroundColor: '#1B4D3E',
          '&:hover': {
            backgroundColor: '#133D31',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px -2px rgba(27, 77, 62, 0.05)',
          border: '1px solid rgba(27, 77, 62, 0.08)',
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': { borderColor: '#D1DED8' },
            '&:hover fieldset': { borderColor: '#3D8C72' },
            '&.Mui-focused fieldset': { borderColor: '#1B4D3E', borderWidth: 1.5 },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;