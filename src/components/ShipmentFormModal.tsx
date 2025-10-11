import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Alert,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import api from '../api/api';
import type { Shipment } from '../pages/ShipmentsPage';

interface ShipmentFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (shipment: Shipment) => void;
  shipmentToEdit: Shipment | null;
}

const ShipmentFormModal: React.FC<ShipmentFormModalProps> = ({ open, onClose, onSave, shipmentToEdit }) => {
  const [shipment, setShipment] = useState({
    origin: '',
    destination: '',
    weight: '',
    status: 'Pendente',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    origin: '',
    destination: '',
    weight: '',
  });
  const [loading, setLoading] = useState(false);

  const isEditing = !!shipmentToEdit;

  useEffect(() => {
    if (open) {
      if (shipmentToEdit) {
        setShipment({
          origin: shipmentToEdit.origin,
          destination: shipmentToEdit.destination,
          weight: String(shipmentToEdit.weight),
          status: shipmentToEdit.status,
        });
      } else {
        resetForm();
      }
    }
  }, [open, shipmentToEdit]);

  const resetForm = () => {
    setShipment({ origin: '', destination: '', weight: '', status: 'Pendente' });
    setError('');
    setFieldErrors({ origin: '', destination: '', weight: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setShipment(prev => ({ ...prev, [name as string]: value }));
  };

  const validateForm = () => {
    const newErrors = { origin: '', destination: '', weight: '' };
    let isValid = true;

    if (!shipment.origin.trim()) {
      newErrors.origin = 'Origem é obrigatória.';
      isValid = false;
    }
    if (!shipment.destination.trim()) {
      newErrors.destination = 'Destino é obrigatório.';
      isValid = false;
    }
    if (!shipment.weight || isNaN(parseInt(shipment.weight, 10)) || parseInt(shipment.weight, 10) <= 0) {
      newErrors.weight = 'Peso deve ser um número positivo.';
      isValid = false;
    }

    setFieldErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!validateForm()) {
      return;
    }

    const shipmentData = {
      origin: shipment.origin.trim(),
      destination: shipment.destination.trim(),
      weight: parseInt(shipment.weight, 10),
      status: shipment.status,
    };

    setLoading(true);
    try {
      let response;
      if (isEditing) {
        response = await api.put(`/api/shipments/${shipmentToEdit!._id}`, shipmentData);
      } else {
        response = await api.post('/api/shipments', shipmentData);
      }
      onSave(response.data);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || `Falha ao ${isEditing ? 'atualizar' : 'cadastrar'} a remessa.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ component: 'form', onSubmit: handleSubmit }}>
      <DialogTitle>{isEditing ? 'Editar Remessa' : 'Adicionar Nova Remessa'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField required name="origin" label="Origem" value={shipment.origin} onChange={handleChange} fullWidth error={!!fieldErrors.origin} helperText={fieldErrors.origin} />
          <TextField required name="destination" label="Destino" value={shipment.destination} onChange={handleChange} fullWidth error={!!fieldErrors.destination} helperText={fieldErrors.destination} />
          <TextField required name="weight" label="Peso (kg)" type="number" value={shipment.weight} onChange={handleChange} fullWidth error={!!fieldErrors.weight} helperText={fieldErrors.weight} />
          <FormControl fullWidth>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              name="status"
              value={shipment.status}
              label="Status"
              onChange={handleChange as any} // Cast to any to handle Select's onChange type
            >
              <MenuItem value="Pendente">Pendente</MenuItem>
              <MenuItem value="Em Trânsito">Em Trânsito</MenuItem>
              <MenuItem value="Entregue">Entregue</MenuItem>
              <MenuItem value="Cancelada">Cancelada</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        <Button type="submit" variant="contained" disabled={loading}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShipmentFormModal;