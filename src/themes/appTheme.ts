import { createTheme, alpha } from '@mui/material/styles';
import { ptBR } from '@mui/material/locale';
export const createAppTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: { main: mode === 'light' ? '#4f46e5' : '#a5a0ff' },
    secondary: { main: '#0d9488' },
    background: { default: mode === 'light' ? '#f5f6fa' : '#10131d', paper: mode === 'light' ? '#ffffff' : '#191e2c' },
    text: { primary: mode === 'light' ? '#182238' : '#edf0f7', secondary: mode === 'light' ? '#647086' : '#a5b0c4' },
    divider: mode === 'light' ? '#e8ebf2' : '#2b3244',
  },
  typography: {
    fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
    h4: { fontWeight: 750, fontSize: '1.85rem', letterSpacing: '-0.045em' },
    h5: { fontWeight: 700, fontSize: '1.3rem', letterSpacing: '-0.025em' },
    h6: { fontWeight: 700, fontSize: '1rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { backgroundImage: 'none' }, outlined: { borderColor: mode === 'light' ? '#e8ebf2' : '#2b3244' } } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 9, padding: '9px 17px' } } },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiTableCell: { styleOverrides: { head: { background: mode === 'light' ? '#f8f9fc' : '#202638', color: mode === 'light' ? '#647086' : '#a5b0c4', fontSize: 12, fontWeight: 700 }, root: { padding: '17px 20px' } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 7, fontWeight: 600 } } },
    MuiTabs: { styleOverrides: { indicator: { height: 3, borderRadius: 4 } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', minHeight: 54, fontWeight: 650 } } },
    MuiListItemButton: { styleOverrides: { root: { borderRadius: 10, '&.Mui-selected': { backgroundColor: alpha('#818cf8', 0.18) } } } },
  },
}, ptBR);
