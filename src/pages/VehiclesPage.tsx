import React, { useState, useEffect } from 'react';
import {
  Button,
  IconButton,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
  Tooltip,
  TablePagination,
  TableSortLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Layout from '../components/Layout';
import ConfirmationDialog from '../components/ConfirmationDialog';
import VehicleFormModal from '../components/VehicleFormModal';
import api from '../api/api';

interface Vehicle {
  _id: string;
  model: string;
  plate: string;
  year: number;
  capacity: number;
}

type Order = 'asc' | 'desc';

const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Vehicle>('model');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/vehicles', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          sort: orderBy,
          order: order,
        },
      });
      setVehicles(response.data?.data || []); 
      setTotalVehicles(response.data?.total || 0); 
    } catch (err: any) {
      setError('Falha ao buscar os veículos. Tente novamente mais tarde.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, rowsPerPage, order, orderBy]); 

  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormModalOpen(true);
  };

  const handleSaveVehicle = (_savedVehicle: Vehicle) => {
    if (editingVehicle) {
      fetchVehicles();
    } else {
      const newTotal = totalVehicles + 1;
      const lastPage = Math.max(0, Math.ceil(newTotal / rowsPerPage) - 1);
      setPage(lastPage);
    }
    setIsFormModalOpen(false);
  };

  const openDeleteDialog = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
  };

  const closeDeleteDialog = () => {
    setVehicleToDelete(null);
  };

  const handleDelete = async () => {
    if (!vehicleToDelete) return;

    try {
      await api.delete(`/api/vehicles/${vehicleToDelete._id}`);

      if (vehicles.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        fetchVehicles();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Falha ao excluir o veículo.");
      console.error(err);
    }

    closeDeleteDialog();
  };

  const handleRequestSort = (property: keyof Vehicle) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Layout>
      <VehicleFormModal
        open={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveVehicle}
        vehicleToEdit={editingVehicle}
      />
      <ConfirmationDialog
        open={!!vehicleToDelete}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={vehicleToDelete ? `Tem certeza de que deseja excluir o veículo ${vehicleToDelete.model} (placa ${vehicleToDelete.plate})? Esta ação não pode ser desfeita.` : ''}
      />
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom component="div">
            Gerenciamento de Veículos
          </Typography>
          <Button variant="contained" onClick={handleOpenAddModal}>
            Adicionar Veículo
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell key="model" sortDirection={orderBy === 'model' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'model'}
                      direction={orderBy === 'model' ? order : 'asc'}
                      onClick={() => handleRequestSort('model')}
                    >
                      Modelo
                    </TableSortLabel>
                  </TableCell>
                  <TableCell key="plate" sortDirection={orderBy === 'plate' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'plate'}
                      direction={orderBy === 'plate' ? order : 'asc'}
                      onClick={() => handleRequestSort('plate')}
                    >
                      Placa
                    </TableSortLabel>
                  </TableCell>
                  <TableCell key="year" align="right" sortDirection={orderBy === 'year' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'year'}
                      direction={orderBy === 'year' ? order : 'asc'}
                      onClick={() => handleRequestSort('year')}
                    >
                      Ano
                    </TableSortLabel>
                  </TableCell>
                  <TableCell key="capacity" align="right" sortDirection={orderBy === 'capacity' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'capacity'}
                      direction={orderBy === 'capacity' ? order : 'asc'}
                      onClick={() => handleRequestSort('capacity')}
                    >
                      Capacidade (kg)
                    </TableSortLabel>
                  </TableCell>
                  <TableCell key="actions" align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle._id}>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>{vehicle.plate}</TableCell>
                    <TableCell align="right">{vehicle.year}</TableCell>
                    <TableCell align="right">{vehicle.capacity}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenEditModal(vehicle)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          onClick={() => openDeleteDialog(vehicle)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalVehicles}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Itens por página:"
            />
          </TableContainer>
        )}
      </Paper>
    </Layout>
  );
};

export default VehiclesPage;