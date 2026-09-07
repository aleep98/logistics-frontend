import { Fragment, useState } from 'react';
import { Alert, Snackbar, Typography } from '@mui/material';
import axios from 'axios';
import Layout from '../components/Layout';
import ResourceList from '../components/ResourceList';
import VehicleFormModal from '../components/VehicleFormModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useCollection } from './useCollection';
import { useDataSync } from './useDataSync';
import type { Vehicle } from '../types/logistics';
import api from '../api/api';
import { isAdmin } from '../auth/session';

export default function VehiclesPage({ embedded = false }: { embedded?: boolean }) {
  const Wrapper = embedded ? Fragment : Layout;
  const collection = useCollection<Vehicle>('/api/vehicles');
  const vehicles = collection.data.map(vehicle => ({ ...vehicle, model: vehicle.vehicleModel || vehicle.model || 'Modelo não informado' }));
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const triggerSync = useDataSync(state => state.triggerSync);
  const remove = async () => {
    if (!deleting || busy) return;
    setBusy(true);
    try { await api.delete(`/api/vehicles/${deleting._id}`); setDeleting(null); setNotice({ text: 'Veículo excluído com sucesso.' }); triggerSync(); }
    catch (error) { setNotice({ text: axios.isAxiosError(error) ? error.response?.data?.error || 'Não foi possível excluir o veículo.' : 'Não foi possível excluir o veículo.', error: true }); }
    finally { setBusy(false); }
  };
  return <Wrapper>
    <ResourceList title="Veículos" description="Organize sua frota e mantenha os cadastros atualizados." {...collection} data={vehicles}
      searchText={vehicle => `${vehicle.model} ${vehicle.plate}`}
      onAdd={() => { setEditing(null); setFormOpen(true); }} addLabel="Adicionar veículo"
      sortOptions={[{ label: 'Modelo A–Z', compare: (a, b) => a.model.localeCompare(b.model) }, { label: 'Maior capacidade', compare: (a, b) => b.capacity - a.capacity }, { label: 'Mais novos', compare: (a, b) => b.year - a.year }]}
      columns={[
        { label: 'Veículo', render: vehicle => <Typography fontWeight={650} fontSize={14}>{vehicle.model}</Typography> },
        { label: 'Placa', render: vehicle => <Typography fontFamily="monospace" fontWeight={600} fontSize={13}>{vehicle.plate}</Typography> },
        { label: 'Ano', render: vehicle => vehicle.year },
        { label: 'Capacidade', render: vehicle => `${Number(vehicle.capacity).toLocaleString('pt-BR')} kg` },
      ]}
      actions={[{ label: 'Editar veículo', run: vehicle => { setEditing(vehicle); setFormOpen(true); } }, ...(isAdmin() ? [{ label: 'Excluir veículo', run: (vehicle: Vehicle) => setDeleting(vehicle), danger: true }] : [])]} />
    <VehicleFormModal open={formOpen} vehicleToEdit={editing} onClose={() => setFormOpen(false)} onSave={() => { setFormOpen(false); setNotice({ text: editing ? 'Veículo atualizado com sucesso.' : 'Veículo cadastrado com sucesso.' }); }} />
    <ConfirmationDialog open={!!deleting} onClose={() => { if (!busy) setDeleting(null); }} onConfirm={remove} busy={busy} title="Excluir veículo?" message={`O veículo ${deleting?.model || ''} (${deleting?.plate || ''}) será excluído. Esta ação não pode ser desfeita.`} />
    <Snackbar open={!!notice} autoHideDuration={6000} onClose={() => setNotice(null)}><Alert severity={notice?.error ? 'error' : 'success'} onClose={() => setNotice(null)}>{notice?.text}</Alert></Snackbar>
  </Wrapper>;
}
