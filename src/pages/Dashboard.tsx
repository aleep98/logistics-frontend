import { Box, Typography } from '@mui/material';
import Layout from '../components/Layout';
import OperationsOverview from '../components/OperationsOverview';
import { isAdmin } from '../auth/session';
export default function DashboardPage() {
  return <Layout>
    <Box sx={{ mb: 3 }}><Typography variant="h4" component="h1">Visão geral da operação</Typography><Typography color="text.secondary" sx={{ mt: 1, fontSize: 14 }}>Acompanhe sua frota e o andamento das entregas.</Typography></Box>
    <OperationsOverview admin={isAdmin()} />
  </Layout>;
}
