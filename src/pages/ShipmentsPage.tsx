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
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Layout from '../components/Layout';
import ConfirmationDialog from '../components/ConfirmationDialog';
import ShipmentFormModal from '../components/ShipmentFormModal';
import api from '../api/api';

export interface Shipment {
  _id: string;
  origin: string;
  destination: string;
  weight: number;
  status: 'Pendente' | 'Em Trânsito' | 'Entregue' | 'Cancelada';
}

type Order = 'asc' | 'desc';

const statusColors: Record<Shipment['status'], 'default' | 'info' | 'success' | 'error'> = {
  Pendente: 'default',
  'Em Trânsito': 'info',
  Entregue: 'success',
  Cancelada: 'error',
};

const ShipmentsPage: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipmentToDelete, setShipmentToDelete] = useState<Shipment | null>(null);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalShipments, setTotalShipments] = useState(0);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof Shipment>('origin');

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/shipments', {
        params: { page: page + 1, limit: rowsPerPage, sort: orderBy, order },
      });
      setShipments(response.data?.data || []);
      setTotalShipments(response.data?.total || 0);
    } catch (err: any) {
      setError('Falha ao buscar as remessas. Tente novamente mais tarde.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [page, rowsPerPage, order, orderBy]);

  const handleOpenAddModal = () => {
    setEditingShipment(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setIsFormModalOpen(true);
  };

  const handleSaveShipment = () => {
    fetchShipments(); // Refetch to see changes
    setIsFormModalOpen(false);
  };

  const openDeleteDialog = (shipment: Shipment) => setShipmentToDelete(shipment);
  const closeDeleteDialog = () => setShipmentToDelete(null);

  const handleDelete = async () => {
    if (!shipmentToDelete) return;
    try {
      await api.delete(`/api/shipments/${shipmentToDelete._id}`);
      if (shipments.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        fetchShipments();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Falha ao excluir a remessa.");
    }
    closeDeleteDialog();
  };

  const handleRequestSort = (property: keyof Shipment) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Layout>
      <ShipmentFormModal open={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSave={handleSaveShipment} shipmentToEdit={editingShipment} />
      <ConfirmationDialog open={!!shipmentToDelete} onClose={closeDeleteDialog} onConfirm={handleDelete} title="Confirmar Exclusão" message={shipmentToDelete ? `Tem certeza de que deseja excluir a remessa de ${shipmentToDelete.origin} para ${shipmentToDelete.destination}?` : ''} />
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom component="div">Gerenciamento de Remessas</Typography>
          <Button variant="contained" onClick={handleOpenAddModal}>Adicionar Remessa</Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {['origin', 'destination', 'weight', 'status'].map((headCell) => (
                    <TableCell key={headCell} align={headCell === 'weight' ? 'right' : 'left'} sortDirection={orderBy === headCell ? order : false}>
                      <TableSortLabel active={orderBy === headCell} direction={orderBy === headCell ? order : 'asc'} onClick={() => handleRequestSort(headCell as keyof Shipment)}>
                        {headCell === 'origin' ? 'Origem' : headCell === 'destination' ? 'Destino' : headCell === 'weight' ? 'Peso (kg)' : 'Status'}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shipments.map((shipment) => (
                  <TableRow key={shipment._id}>
                    <TableCell>{shipment.origin}</TableCell>
                    <TableCell>{shipment.destination}</TableCell>
                    <TableCell align="right">{shipment.weight}</TableCell>
                    <TableCell><Chip label={shipment.status} color={statusColors[shipment.status]} size="small" /></TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar"><IconButton size="small" onClick={() => handleOpenEditModal(shipment)}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Excluir"><IconButton size="small" onClick={() => openDeleteDialog(shipment)}><DeleteIcon /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={totalShipments} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} labelRowsPerPage="Itens por página:" />
          </TableContainer>
        )}
      </Paper>
    </Layout>
  );
};

export default ShipmentsPage;