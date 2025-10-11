import React, { useState, useEffect } from 'react';
import { Paper, Typography } from '@mui/material';
import Layout from '../components/Layout';

const DashboardPage: React.FC = () => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setUserName(userData.name || 'Usuário');
    }
  }, []);

  return (
    <Layout>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Bem-vindo, {userName}!
        </Typography>
        <Typography paragraph>
          Este é o espaço principal do seu sistema. Aqui você poderá visualizar e gerenciar as informações de logística.
        </Typography>
      </Paper>
    </Layout>
  );
};

export default DashboardPage;