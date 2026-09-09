import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#0B6E4F', light: '#4C9A7D', dark: '#064A33', contrastText: '#FFFFFF' },
    secondary: { main: '#4A6363' },
    error: { main: '#BA1A1A' },
    background: { default: '#F7FAF9', paper: '#FFFFFF' },
  },
  shape: { borderRadius: 16 }, // ciri khas M3, lebih besar dari default MUI (4px)
  typography: {
    fontFamily: '"Roboto", "Segoe UI", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.5rem', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 }, // M3 tidak all-caps
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 20 } },
    },
    MuiCard: { styleOverrides: { root: { borderRadius: 20 } } },
    MuiTextField: { defaultProps: { variant: 'outlined' } },
    MuiChip: { styleOverrides: { root: { borderRadius: 8 } } },
  },
});

export default theme;