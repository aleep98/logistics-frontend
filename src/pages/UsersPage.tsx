import { Avatar, Chip, Stack, Typography } from '@mui/material';
import ResourceList from '../components/ResourceList';
import { useCollection } from './useCollection';
interface User { _id: string; name: string; email: string; role: 'admin' | 'dispatcher' | 'driver' }
const roles = { admin: 'Administrador', dispatcher: 'Operador', driver: 'Motorista' };
export default function UsersPage() {
  const collection = useCollection<User>('/api/users');
  return <ResourceList title="Usuários" description="Consulte as pessoas e os perfis de acesso da sua equipe." {...collection}
    searchText={user => `${user.name} ${user.email} ${roles[user.role]}`}
    filters={{ label: 'Perfil', options: Object.entries(roles).map(([value, label]) => ({ value, label })), matches: (user, role) => user.role === role }}
    sortOptions={[{ label: 'Nome A–Z', compare: (a, b) => a.name.localeCompare(b.name) }, { label: 'Nome Z–A', compare: (a, b) => b.name.localeCompare(a.name) }]}
    columns={[
      { label: 'Nome', render: user => <Stack direction="row" spacing={1.5} alignItems="center"><Avatar sx={{ width: 35, height: 35, fontSize: 12, bgcolor: 'action.selected', color: 'primary.main' }}>{user.name.slice(0, 2).toUpperCase()}</Avatar><Typography fontWeight={650} fontSize={14}>{user.name}</Typography></Stack> },
      { label: 'E-mail', render: user => <Typography fontSize={13}>{user.email}</Typography> },
      { label: 'Perfil de acesso', render: user => <Chip size="small" label={roles[user.role] || user.role} color={user.role === 'admin' ? 'primary' : 'default'} variant="outlined" /> },
    ]} />;
}
