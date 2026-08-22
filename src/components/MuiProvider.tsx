'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode } from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1B2A4A',
      dark: '#0F2440',
      light: '#2A3D63',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#C9A227',
      dark: '#B8860B',
      light: '#E0B93A',
      contrastText: '#1C1C1E',
    },
    background: {
      default: '#F8F6F1',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1C1E',
      secondary: '#5A5A5A',
    },
    divider: '#E2DFD6',
  },
  typography: {
    fontFamily: [
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export function MuiProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
export default MuiProvider;