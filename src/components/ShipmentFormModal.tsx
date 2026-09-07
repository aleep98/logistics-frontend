import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import axios from 'axios';
import api from '../api/api';
import { useDataSync } from '../pages/useDataSync';
import type { Shipment } from '../types/logistics';
import { statusInfo, statusKey } from '../types/logistics';
interface Props { open: boolean; onClose: () => void; onSave: (shipment: Shipment) => void; shipmentToEdit: Shipment | null }
export default function ShipmentFormModal({ open, onClose, onSave, shipmentToEdit }: Props) {
  const [reference, setReference] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const triggerSync = useDataSync(state => state.triggerSync);
  useEffect(() => {
    if (!open) return;
    setReference(shipmentToEdit?.reference || '');
    setCustomerName(shipmentToEdit?.customerName || '');
    setDeliveryAddress(shipmentToEdit?.deliveryAddress || '');
    setStatus(statusKey(shipmentToEdit?.status || 'pending'));
    setError('');
  }, [open, shipmentToEdit]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    if (![reference, customerName, deliveryAddress].every(value => value.trim())) { setError('Preencha todos os campos obrigatórios.'); return; }
    setLoading(true); setError('');
    try {
      const data = { reference: reference.trim(), customerName: customerName.trim(), deliveryAddress: deliveryAddress.trim(), status };
      const response = shipmentToEdit ? await api.put(`/api/shipments/${shipmentToEdit._id}`, data) : await api.post('/api/shipments', data);
      onSave(response.data); triggerSync(); onClose();
    } catch (error) { setError(axios.isAxiosError(error) ? error.response?.data?.error || 'Não foi possível salvar a remessa.' : 'Não foi possível salvar a remessa.'); }
    finally { setLoading(false); }
  };
  return <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm" slotProps={{ paper: { component: 'form', onSubmit: submit } }}>
    <DialogTitle>{shipmentToEdit ? 'Editar remessa' : 'Nova remessa'}</DialogTitle>
    <DialogContent><Stack spacing={2.5} sx={{ mt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField autoFocus required label="Referência" value={reference} disabled={!!shipmentToEdit || loading} onChange={event => setReference(event.target.value)} helperText="Número do pedido ou da nota fiscal." />
      <TextField required label="Nome do cliente" value={customerName} disabled={loading} onChange={event => setCustomerName(event.target.value)} />
      <TextField required label="Endereço de entrega" multiline minRows={2} value={deliveryAddress} disabled={loading} onChange={event => setDeliveryAddress(event.target.value)} />
      {shipmentToEdit ? <TextField select label="Status" value={status} disabled={loading} onChange={event => setStatus(event.target.value)}>{Object.entries(statusInfo).map(([value, info]) => <MenuItem key={value} value={value}>{info.label}</MenuItem>)}</TextField> : <Alert severity="info">A remessa será criada com o status Pendente.</Alert>}
    </Stack></DialogContent>
    <DialogActions sx={{ px: 3, pb: 3 }}><Button onClick={onClose} disabled={loading}>Cancelar</Button><Button type="submit" variant="contained" disabled={loading}>{loading ? 'Salvando…' : 'Salvar remessa'}</Button></DialogActions>
  </Dialog>;
}
