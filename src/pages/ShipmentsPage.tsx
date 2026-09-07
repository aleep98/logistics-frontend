import { Fragment, useState } from 'react';
import { Alert, Chip, Snackbar, Typography } from '@mui/material';
import axios from 'axios';
import Layout from '../components/Layout';
import ResourceList from '../components/ResourceList';
import ShipmentFormModal from '../components/ShipmentFormModal';
import ShipmentDetails from '../components/ShipmentDetails';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useCollection } from './useCollection';
import { useDataSync } from './useDataSync';
import type { Shipment } from '../types/logistics';
import { formatDate, statusInfo, statusKey } from '../types/logistics';
import api from '../api/api';
import { isAdmin } from '../auth/session';
export type { Shipment } from '../types/logistics';

export default function ShipmentsPage({ embedded = false }: { embedded?: boolean }) {
  const Wrapper = embedded ? Fragment : Layout;
  const collection = useCollection<Shipment>('/api/shipments');
  const [editing, setEditing] = useState<Shipment | null>(null);
  const [detail, setDetail] = useState<Shipment | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Shipment | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const triggerSync = useDataSync(state => state.triggerSync);
  let canEdit = false;
  try { canEdit = ['admin', 'dispatcher'].includes(JSON.parse(localStorage.getItem('user') || 'null')?.role); } catch { /* Deny unknown sessions. */ }
  const remove = async () => {
    if (!deleting || busy) return;
    setBusy(true);
    try { await api.delete(`/api/shipments/${deleting._id}`); setDeleting(null); setNotice({ text: 'Remessa excluída com sucesso.' }); triggerSync(); }
    catch (error) { setNotice({ text: axios.isAxiosError(error) ? error.response?.data?.error || 'Não foi possível excluir a remessa.' : 'Não foi possível excluir a remessa.', error: true }); }
    finally { setBusy(false); }
  };
  return <Wrapper>
    <ResourceList title="Remessas" description="Acompanhe cada entrega, do cadastro à conclusão." {...collection}
      searchText={shipment => `${shipment.reference} ${shipment.customerName} ${shipment.deliveryAddress} ${shipment.origin || ''} ${shipment.destination || ''}`}
      onAdd={canEdit ? () => { setEditing(null); setFormOpen(true); } : undefined} addLabel="Nova remessa"
      dateValue={shipment => shipment.createdAt}
      filters={{ label: 'Status', options: Object.entries(statusInfo).map(([value, info]) => ({ value, label: info.label })), matches: (shipment, value) => statusKey(shipment.status) === value }}
      sortOptions={[{ label: 'Mais recentes', compare: (a, b) => (b.createdAt || b._id).localeCompare(a.createdAt || a._id) }, { label: 'Cliente A–Z', compare: (a, b) => a.customerName.localeCompare(b.customerName) }, { label: 'Mais antigas', compare: (a, b) => (a.createdAt || a._id).localeCompare(b.createdAt || b._id) }]}
      columns={[
        { label: 'Remessa / cliente', render: shipment => <><Typography fontWeight={700} fontSize={14}>{shipment.reference}</Typography><Typography fontSize={12} color="text.secondary">{shipment.customerName}</Typography></> },
        { label: 'Entrega', render: shipment => <Typography fontSize={13} sx={{ maxWidth: 300 }}>{shipment.deliveryAddress || shipment.destination || 'Não informado'}</Typography> },
        { label: 'Status', render: shipment => <Chip size="small" label={statusInfo[statusKey(shipment.status)]?.label || shipment.status} color={statusInfo[statusKey(shipment.status)]?.color || 'default'} variant="outlined" /> },
        { label: 'Criação', render: shipment => formatDate(shipment.createdAt) },
      ]}
      actions={[{ label: 'Ver detalhes', run: shipment => setDetail(shipment) }, ...(canEdit ? [{ label: 'Editar remessa', run: (shipment: Shipment) => { setEditing(shipment); setFormOpen(true); } }] : []), ...(isAdmin() ? [{ label: 'Excluir remessa', run: (shipment: Shipment) => setDeleting(shipment), danger: true }] : [])]} />
    <ShipmentFormModal open={formOpen} shipmentToEdit={editing} onClose={() => setFormOpen(false)} onSave={() => { setFormOpen(false); setNotice({ text: editing ? 'Remessa atualizada com sucesso.' : 'Remessa cadastrada com sucesso.' }); }} />
    <ShipmentDetails shipment={detail} onClose={() => setDetail(null)} />
    <ConfirmationDialog open={!!deleting} onClose={() => { if (!busy) setDeleting(null); }} onConfirm={remove} busy={busy} title="Excluir remessa?" message={`A remessa ${deleting?.reference || ''} será excluída permanentemente. Esta ação não pode ser desfeita.`} />
    <Snackbar open={!!notice} autoHideDuration={6000} onClose={() => setNotice(null)}><Alert severity={notice?.error ? 'error' : 'success'} onClose={() => setNotice(null)}>{notice?.text}</Alert></Snackbar>
  </Wrapper>;
}
