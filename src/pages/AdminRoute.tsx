import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import api from '../api/api';
import { isAdmin } from '../auth/session';

export default function AdminRoute({ children }: { children: ReactElement }) {
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const token = localStorage.getItem('authToken');
  const admin = isAdmin();

  useEffect(() => {
    if (!token || !admin) return;
    const controller = new AbortController();
    api.get('/api/admin/session', { signal: controller.signal })
      .then(() => setStatus('allowed'))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const code = axios.isAxiosError(error) ? error.response?.status : undefined;
        setStatus(code === 401 ? 'login' : code === 403 ? 'forbidden' : 'error');
      });
    return () => controller.abort();
  }, [token, admin, attempt]);

  if (!token || status === 'login') return <Navigate to="/login" replace />;
  if (!admin || status === 'forbidden') return <Navigate to="/dashboard" replace />;
  if (status === 'allowed') return children;
  return <Box sx={{ p: 4 }}>
    {status === 'error' ? <Alert severity="error" action={<Button onClick={() => {
      setStatus('loading');
      setAttempt(value => value + 1);
    }}>Tentar novamente</Button>}>Não foi possível verificar sua permissão de administrador.</Alert>
      : <CircularProgress aria-label="Verificando permissão de administrador" />}
  </Box>;
}
