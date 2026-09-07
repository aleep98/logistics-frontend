import { Link } from 'react-router-dom';
import { Alert, Avatar, Box, Button, Chip, LinearProgress, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { PeopleOutlineRounded, LocalShippingOutlined, DirectionsCarOutlined, ScheduleRounded, ArrowForwardRounded } from '@mui/icons-material';
import { useCollection } from '../pages/useCollection';
import type { Shipment, Vehicle } from '../types/logistics';
import { formatDate, statusInfo, statusKey } from '../types/logistics';

export default function OperationsOverview({ admin = false, compact = false }: { admin?: boolean; compact?: boolean }) {
  const users = useCollection<unknown>(admin ? '/api/users' : null);
  const vehicles = useCollection<Vehicle>('/api/vehicles');
  const shipments = useCollection<Shipment>('/api/shipments');
  const pending = shipments.data.filter(item => statusKey(item.status) === 'pending').length;
  const transit = shipments.data.filter(item => statusKey(item.status) === 'in_transit').length;
  const cards = [
    ...(admin ? [{ label: 'Usuários', value: users.data.length, hint: 'Pessoas cadastradas', icon: <PeopleOutlineRounded />, color: '#6655d8', loading: users.loading, error: users.error, retry: users.retry }] : []),
    { label: 'Veículos', value: vehicles.data.length, hint: 'Frota cadastrada', icon: <DirectionsCarOutlined />, color: '#0f8b80', loading: vehicles.loading, error: vehicles.error, retry: vehicles.retry },
    { label: 'Em trânsito', value: transit, hint: 'Remessas em andamento', icon: <LocalShippingOutlined />, color: '#3378c4', loading: shipments.loading, error: shipments.error, retry: shipments.retry },
    { label: 'Pendentes', value: pending, hint: 'Aguardando andamento', icon: <ScheduleRounded />, color: '#b77c15', loading: shipments.loading, error: shipments.error, retry: shipments.retry },
  ];
  return <>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: `repeat(${cards.length}, 1fr)` }, gap: 2, mb: 3 }}>
      {cards.map(card => <Paper variant="outlined" key={card.label} sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography fontSize={13} color="text.secondary" fontWeight={600}>{card.label}</Typography><Avatar variant="rounded" sx={{ width: 39, height: 39, bgcolor: `${card.color}16`, color: card.color }}>{card.icon}</Avatar></Stack>
        {card.loading ? <Skeleton width="45%" height={55} /> : card.error ? <Button size="small" onClick={card.retry}>Tentar novamente</Button> : <Typography sx={{ fontWeight: 750, fontSize: 34, letterSpacing: '-0.05em', my: 0.5 }}>{card.value.toLocaleString('pt-BR')}</Typography>}
        <Typography fontSize={12} color="text.secondary">{card.error ? 'Dados indisponíveis' : card.hint}</Typography>
      </Paper>)}
    </Box>
    {!compact && <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1.6fr' }, gap: 3, mb: 3 }}>
      <Paper variant="outlined" sx={{ p: 3 }}><Typography variant="h6">Panorama das entregas</Typography><Typography fontSize={13} color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>Distribuição de todas as remessas por status</Typography>
        {shipments.loading ? <Skeleton height={180} /> : shipments.error ? <Alert severity="error" action={<Button onClick={shipments.retry}>Recarregar</Button>}>Dados indisponíveis.</Alert> : <>
          <Typography variant="h4">{shipments.data.length}<Box component="span" sx={{ fontSize: 13, fontWeight: 400, color: 'text.secondary', ml: 1 }}>remessas no total</Box></Typography>
          <Stack spacing={2.5} sx={{ mt: 3 }}>{Object.entries(statusInfo).map(([key, info]) => {
            const count = shipments.data.filter(item => statusKey(item.status) === key).length;
            return <Box key={key}><Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}><Typography fontSize={13}>{info.label}</Typography><Typography fontSize={13} fontWeight={700}>{count}</Typography></Stack><LinearProgress aria-label={info.label} variant="determinate" color={info.color} value={shipments.data.length ? count / shipments.data.length * 100 : 0} sx={{ height: 7, borderRadius: 8, bgcolor: 'action.hover' }} /></Box>;
          })}</Stack>
        </>}
      </Paper>
      <Paper variant="outlined" sx={{ p: 3 }}><Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}><Typography variant="h6">Remessas recentes</Typography><Button component={Link} to={admin ? '/admin/shipments' : '/shipments'} size="small" endIcon={<ArrowForwardRounded />}>Ver todas</Button></Stack>
        {shipments.loading ? <Stack spacing={1}>{[1, 2, 3].map(key => <Skeleton key={key} height={80} />)}</Stack> : shipments.error ? <Alert severity="error" sx={{ mt: 3 }}>Não foi possível carregar as remessas.</Alert> : shipments.data.length === 0 ? <Box sx={{ py: 6, textAlign: 'center' }}><LocalShippingOutlined sx={{ fontSize: 40, color: 'text.secondary' }} /><Typography sx={{ mt: 2 }} color="text.secondary">Suas próximas remessas aparecerão aqui.</Typography></Box> : <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />} sx={{ mt: 2 }}>{[...shipments.data].sort((a, b) => (b.createdAt || b._id).localeCompare(a.createdAt || a._id)).slice(0, 5).map(item => <Stack key={item._id} direction="row" justifyContent="space-between" spacing={2} sx={{ py: 2 }}>
          <Box sx={{ minWidth: 0 }}><Typography fontSize={14} fontWeight={650}>{item.reference}</Typography><Typography fontSize={12} color="text.secondary" noWrap>{item.customerName}</Typography></Box><Box sx={{ textAlign: 'right' }}><Chip size="small" variant="outlined" label={statusInfo[statusKey(item.status)]?.label || item.status} color={statusInfo[statusKey(item.status)]?.color || 'default'} /><Typography fontSize={11} color="text.secondary" sx={{ mt: 0.5 }}>{formatDate(item.createdAt)}</Typography></Box>
        </Stack>)}</Stack>}
      </Paper>
    </Box>}
  </>;
}
