export interface Vehicle {
  _id: string;
  model: string;
  vehicleModel?: string;
  plate: string;
  year: number;
  capacity: number;
  createdAt?: string;
}
export interface Shipment {
  _id: string;
  origin?: string;
  destination?: string;
  weight?: number;
  status: string;
  reference: string;
  customerName: string;
  deliveryAddress: string;
  createdAt: string;
  updatedAt?: string;
  assignedDriver?: { name: string } | string;
  assignedVehicle?: { plate: string; vehicleModel?: string; model?: string } | string;
}
export const statusInfo: Record<string, { label: string; color: 'warning' | 'info' | 'success' | 'error' }> = {
  pending: { label: 'Pendente', color: 'warning' },
  in_transit: { label: 'Em trânsito', color: 'info' },
  delivered: { label: 'Entregue', color: 'success' },
  cancelled: { label: 'Cancelada', color: 'error' },
};
export function statusKey(status: string) {
  return ({ Pendente: 'pending', 'Em Transito': 'in_transit', 'Em Trânsito': 'in_transit', Entregue: 'delivered', Cancelada: 'cancelled' } as Record<string, string>)[status] || status;
}
export function formatDate(value?: string) {
  return value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleDateString('pt-BR') : 'Não informado';
}
