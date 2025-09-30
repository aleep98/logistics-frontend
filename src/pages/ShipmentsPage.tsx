import React from 'react';
import { Paper, Typography } from '@mui/material';
import Layout from '../components/Layout';

const ShipmentsPage: React.FC = () => {
  return (
    <Layout>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Gerenciamento de Remessas
        </Typography>
        <Typography paragraph>Aqui você poderá visualizar e gerenciar as remessas.</Typography>
      </Paper>
    </Layout>
  );
};

export default ShipmentsPage;