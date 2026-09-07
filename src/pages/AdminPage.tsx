import { Navigate, Route, Routes, Link, useLocation } from 'react-router-dom';
import { Box, Chip, Tab, Tabs, Typography } from '@mui/material';
import Layout from '../components/Layout';
import VehiclesPage from './VehiclesPage';
import ShipmentsPage from './ShipmentsPage';
import UsersPage from './UsersPage';
import OperationsOverview from '../components/OperationsOverview';

export default function AdminPage() {
  const { pathname } = useLocation();
  const section = pathname.split('/')[2] || 'users';
  return <Layout>
    <Box sx={{ mb: 3 }}>
      <Chip label="Área administrativa" color="primary" variant="outlined" size="small" sx={{ mb: 1.5 }} />
      <Typography variant="h4" component="h1">Painel administrativo</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, fontSize: 14 }}>Sua equipe, sua frota e suas entregas em um só lugar.</Typography>
    </Box>
    <OperationsOverview admin compact />
    <Tabs value={['users', 'vehicles', 'shipments'].includes(section) ? section : false}
      aria-label="Seções do painel administrativo" variant="scrollable" sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
      <Tab component={Link} to="/admin/users" value="users" label="Usuários" />
      <Tab component={Link} to="/admin/vehicles" value="vehicles" label="Veículos" />
      <Tab component={Link} to="/admin/shipments" value="shipments" label="Remessas" />
    </Tabs>
    <Routes>
      <Route index element={<Navigate to="users" replace />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="vehicles" element={<VehiclesPage embedded />} />
      <Route path="shipments" element={<ShipmentsPage embedded />} />
      <Route path="*" element={<Navigate to="/admin/users" replace />} />
    </Routes>
  </Layout>;
}
