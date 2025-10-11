import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';

import { Paper, Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, Divider } from '@mui/material';
import Layout from '../components/Layout';
import api from '../api/api';

interface Vehicle {
  _id: string;
  model: string;
  plate: string;
  year: number;
  capacity: number;
}

interface Shipment {
  _id: string;
  origin: string;
  destination: string;
  status: 'Pendente' | 'Em Trânsito' | 'Entregue' | 'Cancelada';
  createdAt: string;
}

interface Stats {
  vehicleCount: number;
  shipmentCount: number; // Placeholder
  totalCapacity: number;
}

const DashboardPage: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentVehicles, setRecentVehicles] = useState<Vehicle[]>([]);
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setUserName(userData.name || 'Usuário');
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch vehicles and shipments in parallel
        const [vehicleResponse, shipmentResponse] = await Promise.allSettled([
          api.get('/api/vehicles?limit=0'), // limit=0 to get all
          api.get('/api/shipments?sort=createdAt&order=desc&limit=5') // Get 5 most recent
        ]);

        let vehicleCount = 0;
        let totalCapacity = 0;
        let shipmentCount = 0;

        if (vehicleResponse.status === 'fulfilled') {
          const allVehicles: Vehicle[] = vehicleResponse.value.data?.data || [];
          vehicleCount = allVehicles.length;
          totalCapacity = allVehicles.reduce((sum, vehicle) => sum + vehicle.capacity, 0);
          const recent = allVehicles.sort((a, b) => b._id.localeCompare(a._id)).slice(0, 5);
          setRecentVehicles(recent);
        } else {
          console.error("Failed to fetch vehicles:", vehicleResponse.reason);
        }

        if (shipmentResponse.status === 'fulfilled') {
          const shipmentsData: Shipment[] = shipmentResponse.value.data?.data || [];
          shipmentCount = shipmentResponse.value.data?.total || 0;
          setRecentShipments(shipmentsData);
        } else {
          console.error("Failed to fetch shipments:", shipmentResponse.reason);
        }

        setStats({
          vehicleCount,
          shipmentCount,
          totalCapacity,
        });

      } catch (err) {
        setError('Não foi possível carregar os dados do dashboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Bem-vindo, {userName}!
      </Typography>
      <Typography paragraph sx={{ mb: 3 }}>
        Este é o resumo das suas operações de logística.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Stat Cards */}
          <Grid xs={9} sm={6} md={4}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">Total de Veículos</Typography><Typography variant="h4">{stats?.vehicleCount}</Typography></Paper></Grid>
          <Grid xs={9} sm={6} md={4}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">Capacidade Total (kg)</Typography><Typography variant="h4">{stats?.totalCapacity}</Typography></Paper></Grid>
          <Grid xs={9} sm={6} md={4}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">Total de Remessas</Typography><Typography variant="h4">{stats?.shipmentCount}</Typography></Paper></Grid>

          {/* Recent Vehicles */}
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Veículos Adicionados Recentemente</Typography>
              <List>
                {recentVehicles.length > 0 ? recentVehicles.map((v, index) => (
                  <React.Fragment key={v._id}>
                    <ListItem>
                      <ListItemText primary={v.model} secondary={`Placa: ${v.plate} | Capacidade: ${v.capacity}kg`} />
                    </ListItem>
                    {index < recentVehicles.length - 1 && <Divider />}
                  </React.Fragment>
                )) : <Typography>Nenhum veículo encontrado.</Typography>}
              </List>
            </Paper>
          </Grid>

          {/* Placeholder for Recent Shipments */}
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 2, minHeight: '100%' }}>
            <Typography variant="h6" gutterBottom>Remessas Recentes</Typography>
              <List>
                {recentShipments.length > 0 ? recentShipments.map((s, index) => (
                  <React.Fragment key={s._id}>
                    <ListItem>
                      <ListItemText primary={`${s.origin} → ${s.destination}`} secondary={`Status: ${s.status}`} />
                    </ListItem>
                    {index < recentShipments.length - 1 && <Divider />}
                  </React.Fragment>
                )) : <Typography>Nenhuma remessa encontrada.</Typography>}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
};

export default DashboardPage;