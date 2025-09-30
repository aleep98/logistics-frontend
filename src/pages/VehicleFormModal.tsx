import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import api from '../api/api';

interface Vehicle {
  id: string;
  model: string;
  plate: string;
  year: number;
  capacity: number;
}

interface VehicleFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void; // This is the corrected type
  vehicleToEdit: Vehicle | null;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  open,
  onClose,
  onSave,
  vehicleToEdit,
}) => {
  const [vehicle, setVehicle] = useState({ model: '', plate: '', year: '', capacity: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vehicleToEdit) {
      setVehicle({
        model: vehicleToEdit.model,
        plate: vehicleToEdit.plate,
        year: String(vehicleToEdit.year),
        capacity: String(vehicleToEdit.capacity),
      });
    } else {
      setVehicle({ model: '', plate: '', year: '', capacity: '' });
    }
    setError(null);
  }, [vehicleToEdit, open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVehicle({ ...vehicle, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Mapeia o estado do formulário para o formato que o backend espera
    const vehicleData = {
      model: vehicle.model,
      plate: vehicle.plate,
      year: parseInt(vehicle.year, 10),
      capacity: parseInt(vehicle.capacity, 10),
    };

    try {
      let response;
      if (vehicleToEdit) {
        // Envia os dados no formato esperado pelo backend
        response = await api.put(`/api/vehicles/${vehicleToEdit.id}`, vehicleData); 
      } else {
        response = await api.post('/api/vehicles', vehicleData);
      }
      // Garante que o ID seja repassado corretamente.
      // Se for uma edição, a resposta pode não conter o ID, então usamos o que já temos. Se for criação, usamos o ID da resposta.
      const savedVehicleWithId = { ...response.data, id: vehicleToEdit ? vehicleToEdit.id : response.data.id };
      onSave(savedVehicleWithId);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save vehicle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" component="h2">
          {vehicleToEdit ? 'Editar Veículo' : 'Adicionar Veículo'}
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <TextField margin="normal" required fullWidth label="Modelo" name="model" value={vehicle.model} onChange={handleChange} />
        <TextField margin="normal" required fullWidth label="Placa" name="plate" value={vehicle.plate} onChange={handleChange} />
        <TextField margin="normal" required fullWidth label="Ano" name="year" type="number" value={vehicle.year} onChange={handleChange} />
        <TextField margin="normal" required fullWidth label="Capacidade (kg)" name="capacity" type="number" value={vehicle.capacity} onChange={handleChange} />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default VehicleFormModal;