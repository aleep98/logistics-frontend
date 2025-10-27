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
} from '@mui/material';
import api from '../api/api';
import { useDataSync } from '../pages/useDataSync';

interface Vehicle {
  _id: string;
  model: string;
  plate: string;
  year: number;
  capacity: number;
}

interface VehicleFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
  vehicleToEdit: Vehicle | null;
}

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({ open, onClose, onSave, vehicleToEdit }) => {
  const [vehicle, setVehicle] = useState({
    
    model: '',
    plate: '',
    year: '',
    capacity: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    model: '',
    plate: '',
    year: '',
    capacity: '',
  });
  const [loading, setLoading] = useState(false);
  const { triggerSync } = useDataSync();

  const isEditing = !!vehicleToEdit;

  useEffect(() => {
    if (open) {
      if (vehicleToEdit) {
        setVehicle({
          model: vehicleToEdit.model,
          plate: vehicleToEdit.plate,
          year: String(vehicleToEdit.year),
          capacity: String(vehicleToEdit.capacity),
        });
      } else {
        resetForm();
      }
    }
  }, [open, vehicleToEdit]);

  const resetForm = () => {
    setVehicle({ model: '', plate: '', year: '', capacity: '' });
    setError('');
    setFieldErrors({ model: '', plate: '', year: '', capacity: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setVehicle(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = { model: '', plate: '', year: '', capacity: '' };
    let isValid = true;

    if (!vehicle.model.trim()) {
      newErrors.model = 'Model is required.';
      isValid = false;
    }
    if (!vehicle.plate.trim()) {
      newErrors.plate = 'Plate is required.';
      isValid = false;
    }
    if (!vehicle.year || isNaN(parseInt(vehicle.year, 10)) || parseInt(vehicle.year, 10) <= 0) {
      newErrors.year = 'Year must be a positive number.';
      isValid = false;
    }
    if (!vehicle.capacity || isNaN(parseInt(vehicle.capacity, 10)) || parseInt(vehicle.capacity, 10) <= 0) {
      newErrors.capacity = 'Capacity must be a positive number.';
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

    const vehicleData = {
      vehicleModel: vehicle.model.trim(),
      model: vehicle.model.trim(),
      plate: vehicle.plate.trim(),
      year: parseInt(vehicle.year, 10),
      capacity: parseInt(vehicle.capacity, 10),
    };

    setLoading(true);
    try {
      if (isEditing) {
        const response = await api.put(`/api/vehicles/${vehicleToEdit!._id}`, vehicleData);
        onSave(response.data);
        triggerSync();
      } else {
        const response = await api.post('/api/vehicles', vehicleData);
        onSave(response.data);
        triggerSync();
      }
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${isEditing ? 'update' : 'add'} vehicle.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ component: 'form', onSubmit: handleSubmit }}>
      <DialogTitle>{isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            required
            name="model"
            label="Model"
            value={vehicle.model}
            onChange={handleChange}
            fullWidth
            error={!!fieldErrors.model}
            helperText={fieldErrors.model}
          />
          <TextField
            required
            name="plate"
            label="Plate"
            value={vehicle.plate}
            onChange={handleChange}
            fullWidth
            error={!!fieldErrors.plate}
            helperText={fieldErrors.plate}
          />
          <TextField
            required
            name="year"
            label="Year"
            type="number"
            value={vehicle.year}
            onChange={handleChange}
            fullWidth
            error={!!fieldErrors.year}
            helperText={fieldErrors.year}
          />
          <TextField
            required
            name="capacity"
            label="Capacity (kg)"
            type="number"
            value={vehicle.capacity}
            onChange={handleChange}
            fullWidth
            error={!!fieldErrors.capacity}
            helperText={fieldErrors.capacity}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={loading}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default VehicleFormModal;