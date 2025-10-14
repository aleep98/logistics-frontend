import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';

import { Paper, Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, Divider } from '@mui/material';
import Layout from '../components/Layout';
import api from '../api/api';

// Import icons
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ScaleIcon from '@mui/icons-material/Scale';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useDataSync } from './useDataSync';

interface Vehicle {
  _id: string;
  model: string;
  plate: string;
  year: number;
  capacity: number;
  // Assuming createdAt might exist in the future, adding it for better sorting
  createdAt?: string;
  addedBy?: {
    name: string;
  };
}

interface Shipment {
  _id: string;
  origin: string;
  destination: string;
  status: 'Pendente' | 'Em Trânsito' | 'Entregue' | 'Cancelada';
  createdAt: string;
  reference: string;
  customerName: string;
  deliveryAddress: string;
  addedBy?: {
    name: string;
  };
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
  const { syncKey } = useDataSync();

  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUserName(userData.name || 'Usuário');
      } catch (parseError) {
        console.error("Failed to parse user data from localStorage:", parseError);
        setUserName('Usuário'); // Fallback
      }
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
        let fetchedRecentVehicles: Vehicle[] = [];
        let fetchedRecentShipments: Shipment[] = [];

        if (vehicleResponse.status === 'fulfilled') {
          const allVehicles: Vehicle[] = vehicleResponse.value.data?.data || [];
          vehicleCount = allVehicles.length;
          totalCapacity = allVehicles.reduce((sum, vehicle) => sum + vehicle.capacity, 0);
          // Sort by _id (or createdAt if available) to get the 5 most recent
          fetchedRecentVehicles = allVehicles
            .sort((a, b) => (b.createdAt || b._id).localeCompare(a.createdAt || a._id))
            .slice(0, 5);
        } else {
          console.error("Falha ao buscar veículos:", vehicleResponse.reason);
          setError(prev => prev ? prev + '\nFalha ao carregar veículos.' : 'Falha ao carregar veículos.');
        }

        if (shipmentResponse.status === 'fulfilled') {
          fetchedRecentShipments = shipmentResponse.value.data?.data || [];
          shipmentCount = shipmentResponse.value.data?.total || 0;
          // Assuming total count is available from the API
        } else {
          console.error("Falha ao buscar remessas:", shipmentResponse.reason);
          setError(prev => prev ? prev + '\nFalha ao carregar remessas.' : 'Falha ao carregar remessas.');
        }

        setRecentVehicles(fetchedRecentVehicles);
        setRecentShipments(fetchedRecentShipments);
        setStats({
          vehicleCount,
          shipmentCount,
          totalCapacity,
        });

      } catch (err) {
        console.error("Erro inesperado ao carregar dados do dashboard:", err);
        setError('Ocorreu um erro inesperado ao carregar os dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [syncKey]); // Recarrega os dados quando a syncKey mudar

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

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
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <DirectionsCarIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
              <Typography variant="h6">Total de Veículos</Typography>
              <Typography variant="h4">{stats?.vehicleCount}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ScaleIcon sx={{ fontSize: 40, mb: 1, color: 'secondary.main' }} />
              <Typography variant="h6">Capacidade Total (kg)</Typography>
              <Typography variant="h4">{stats?.totalCapacity}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <LocalShippingIcon sx={{ fontSize: 40, mb: 1, color: 'info.main' }} />
              <Typography variant="h6">Total de Remessas</Typography>
              <Typography variant="h4">{stats?.shipmentCount}</Typography>
            </Paper>
          </Grid>

          {/* Recent Vehicles */}
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Veículos Adicionados Recentemente</Typography>
              <List>
                {recentVehicles.length > 0 ? recentVehicles.map((v, index) => (
                  <>
                    <ListItem>
                      <ListItemText
                        primary={v.model}
                        secondary={
                          <>
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              {`Placa: ${v.plate} | Capacidade: ${v.capacity}kg`}
                            </Box>
                            {v.addedBy && (
                              <Box component="span" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
                                <AccountCircleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                Adicionado por: {v.addedBy.name}
                              </Box>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    {index < recentVehicles.length - 1 && <Divider component="li" />}
                  </>
                )) : <Typography sx={{ p: 2 }}>Nenhum veículo encontrado.</Typography>}
              </List>
            </Paper>
          </Grid>

          {/* Recent Shipments */}
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 2, minHeight: '100%' }}>
            <Typography variant="h6" gutterBottom>Remessas Recentes</Typography>
              <List>
                {recentShipments.length > 0 ? recentShipments.map((s, index) => (
                  <>
                    <ListItem>
                      <ListItemText
                        primary={`${s.origin} → ${s.destination}`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary" display="block">
                              Cliente: {s.customerName} (Ref: {s.reference})
                            </Typography>
                            <Typography component="span" variant="body2" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Endereço: {s.deliveryAddress}
                            </Typography>
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: 'text.secondary' }}>
                              Status: {s.status} |
                              <AccessTimeIcon sx={{ fontSize: 16, ml: 0.5, mr: 0.5 }} />
                              {formatDate(s.createdAt).split(',')[0]} {/* Show only date for brevity */}
                            </Box>
                            {s.addedBy && (
                              <Box component="span" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
                                <AccountCircleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                Adicionado por: {s.addedBy.name}
                              </Box>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    {index < recentShipments.length - 1 && <Divider component="li" />}
                  </>
                )) : <Typography sx={{ p: 2 }}>Nenhuma remessa encontrada.</Typography>}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
};

export default DashboardPage;