import { Box, Chip, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { CloseRounded, RadioButtonCheckedRounded } from '@mui/icons-material';
import type { Shipment } from '../types/logistics';
import { formatDate, statusInfo, statusKey } from '../types/logistics';
export default function ShipmentDetails({ shipment, onClose }: { shipment: Shipment | null; onClose: () => void }) {
  const status = shipment && statusInfo[statusKey(shipment.status)];
  return <Drawer anchor="right" open={!!shipment} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 440 }, p: 3 } } }}>
    {shipment && <>
      <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="h5">Detalhes da remessa</Typography><IconButton aria-label="Fechar detalhes" onClick={onClose}><CloseRounded /></IconButton></Stack>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Referência {shipment.reference}</Typography>
      <Chip label={status?.label || shipment.status} color={status?.color || 'default'} sx={{ alignSelf: 'flex-start', mb: 3 }} />
      <Stack spacing={2.5}>
        {[['Cliente', shipment.customerName], ['Endereço de entrega', shipment.deliveryAddress], ['Origem', shipment.origin], ['Destino', shipment.destination], ['Peso', shipment.weight ? `${shipment.weight} kg` : undefined], ['Motorista', typeof shipment.assignedDriver === 'object' ? shipment.assignedDriver.name : undefined], ['Veículo', typeof shipment.assignedVehicle === 'object' ? `${shipment.assignedVehicle.vehicleModel || shipment.assignedVehicle.model || ''} · ${shipment.assignedVehicle.plate}` : undefined]].map(([label, value]) => <Box key={label}><Typography fontSize={12} color="text.secondary">{label}</Typography><Typography fontSize={14} fontWeight={600} sx={{ mt: 0.5 }}>{value || 'Não informado'}</Typography></Box>)}
      </Stack>
      <Divider sx={{ my: 3 }} /><Typography variant="h6" sx={{ mb: 2 }}>Datas do registro</Typography>
      <Stack spacing={2}>{[['Criação da remessa', shipment.createdAt], ['Última atualização', shipment.updatedAt]].map(([label, date]) => <Stack key={label} direction="row" spacing={1.5}><RadioButtonCheckedRounded sx={{ color: 'primary.main', fontSize: 18, mt: 0.3 }} /><Box><Typography fontSize={14}>{label}</Typography><Typography color="text.secondary" fontSize={12}>{formatDate(date)}</Typography></Box></Stack>)}</Stack>
    </>}
  </Drawer>;
}
