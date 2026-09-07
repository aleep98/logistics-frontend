import { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { createAppTheme } from './themes/appTheme';
import { usePreferences } from './themes/preferences';

export default function Root() {
  const mode = usePreferences(state => state.mode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  return <ThemeProvider theme={theme}><BrowserRouter><App /></BrowserRouter></ThemeProvider>;
}
