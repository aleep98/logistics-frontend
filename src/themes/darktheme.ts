import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#5B5BF0' },
    background: { default: '#0B0B1A', paper: '#141429' },
    text: { primary: '#FFFFFF', secondary: '#B0B0C3' },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCard: { defaultProps: { elevation: 6 } },
  },
});
