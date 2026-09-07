import { useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Box, Button, Chip, IconButton, InputAdornment, Menu, MenuItem, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography } from '@mui/material';
import { AddRounded, SearchRounded, MoreHorizRounded, SearchOffRounded, RefreshRounded } from '@mui/icons-material';

interface Column<T> { label: string; render: (item: T) => ReactNode }
interface Action<T> { label: string; run: (item: T) => void; danger?: boolean }
interface Props<T> {
  title: string; description: string; data: T[]; loading: boolean; error: boolean;
  retry: () => void; columns: Column<T>[]; searchText: (item: T) => string;
  actions?: Action<T>[]; onAdd?: () => void; addLabel?: string;
  filters?: { label: string; options: { value: string; label: string }[]; matches: (item: T, value: string) => boolean };
  dateValue?: (item: T) => string | undefined;
  sortOptions: { label: string; compare: (a: T, b: T) => number }[];
}
export default function ResourceList<T extends { _id: string }>({ title, description, data, loading, error, retry, columns, searchText, actions = [], onAdd, addLabel, filters, dateValue, sortOptions }: Props<T>) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [sort, setSort] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [menu, setMenu] = useState<{ anchor: HTMLElement; item: T } | null>(null);
  const normalized = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filtered = data.filter(item => {
    if (!normalized(searchText(item)).includes(normalized(search))) return false;
    if (filter && filters && !filters.matches(item, filter)) return false;
    if (dateValue && (start || end)) {
      const date = new Date(dateValue(item) || '');
      if (Number.isNaN(date.getTime())) return false;
      const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      if ((start && day < start) || (end && day > end)) return false;
    }
    return true;
  }).sort(sortOptions[sort].compare);
  const safePage = Math.min(page, Math.max(0, Math.ceil(filtered.length / size) - 1));
  const rows = filtered.slice(safePage * size, (safePage + 1) * size);
  const clear = () => { setSearch(''); setFilter(''); setStart(''); setEnd(''); setPage(0); };
  const actionButton = (item: T) => actions.length > 0 && <IconButton aria-label={`Ações de ${searchText(item)}`} aria-haspopup="menu" onClick={event => setMenu({ anchor: event.currentTarget, item })}><MoreHorizRounded /></IconButton>;
  return <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" sx={{ p: 3 }}>
      <Box><Stack direction="row" spacing={1} alignItems="center"><Typography variant="h5" component="h2">{title}</Typography>{!loading && !error && <Chip label={data.length} size="small" />}</Stack><Typography color="text.secondary" fontSize={13} sx={{ mt: 0.5 }}>{description}</Typography></Box>
      <Stack direction="row" spacing={1} alignItems="center"><IconButton aria-label={`Atualizar ${title.toLowerCase()}`} onClick={retry} disabled={loading}><RefreshRounded /></IconButton>{onAdd && <Button variant="contained" startIcon={<AddRounded />} onClick={onAdd}>{addLabel}</Button>}</Stack>
    </Stack>
    <Stack direction={{ xs: 'column', sm: 'row' }} useFlexGap flexWrap="wrap" spacing={1.5} sx={{ px: 3, pb: 3 }}>
      <TextField label={`Buscar ${title.toLowerCase()}`} value={search} onChange={event => { setSearch(event.target.value); setPage(0); }} sx={{ flex: 1, minWidth: { sm: 210 } }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> } }} />
      {filters && <TextField select label={filters.label} value={filter} onChange={event => { setFilter(event.target.value); setPage(0); }} sx={{ minWidth: 155 }}><MenuItem value="">Todos</MenuItem>{filters.options.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</TextField>}
      <TextField select label="Ordenar por" value={sort} onChange={event => { setSort(Number(event.target.value)); setPage(0); }} sx={{ minWidth: 160 }}>{sortOptions.map((option, index) => <MenuItem key={option.label} value={index}>{option.label}</MenuItem>)}</TextField>
      {dateValue && <><TextField type="date" label="Criadas desde" value={start} onChange={event => { setStart(event.target.value); setPage(0); }} slotProps={{ inputLabel: { shrink: true } }} /><TextField type="date" label="Até" value={end} error={!!start && !!end && end < start} helperText={start && end && end < start ? 'Use uma data após o início.' : undefined} onChange={event => { setEnd(event.target.value); setPage(0); }} slotProps={{ inputLabel: { shrink: true } }} /></>}
      {(search || filter || start || end) && <Button onClick={clear}>Limpar filtros</Button>}
    </Stack>
    {loading ? <Stack spacing={1.5} sx={{ p: 3 }} aria-label="Carregando registros">{[1, 2, 3, 4].map(key => <Skeleton key={key} variant="rounded" height={55} />)}</Stack>
      : error ? <Alert severity="error" sx={{ m: 3 }} action={<Button onClick={retry}>Tentar novamente</Button>}>Não foi possível carregar os dados.</Alert>
      : rows.length === 0 ? <Box sx={{ textAlign: 'center', py: 7, px: 3 }}><SearchOffRounded sx={{ fontSize: 44, color: 'text.secondary', mb: 1 }} /><Typography variant="h6">Nenhum registro encontrado</Typography><Typography color="text.secondary" fontSize={14} sx={{ mt: 1 }}>{data.length ? 'Altere os filtros para encontrar o que procura.' : 'Os registros aparecerão aqui assim que forem cadastrados.'}</Typography></Box>
      : <>
        <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}><Table aria-label={title}>
          <TableHead><TableRow>{columns.map(column => <TableCell key={column.label}>{column.label}</TableCell>)}{actions.length > 0 && <TableCell align="right">Ações</TableCell>}</TableRow></TableHead>
          <TableBody>{rows.map(item => <TableRow key={item._id} hover>{columns.map(column => <TableCell key={column.label}>{column.render(item)}</TableCell>)}{actions.length > 0 && <TableCell align="right">{actionButton(item)}</TableCell>}</TableRow>)}</TableBody>
        </Table></TableContainer>
        <Stack spacing={2} sx={{ display: { md: 'none' }, px: 2, pb: 2 }}>{rows.map(item => <Paper key={item._id} variant="outlined" sx={{ p: 2 }}>
          {columns.map((column, index) => <Stack key={column.label} direction="row" alignItems="start" justifyContent="space-between" spacing={2} sx={{ mb: 1.5 }}><Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}><Typography color="text.secondary" fontSize={11} sx={{ mb: 0.5 }}>{column.label}</Typography>{column.render(item)}</Box>{index === 0 && actionButton(item)}</Stack>)}
        </Paper>)}</Stack>
      </>}
    {!loading && !error && <TablePagination component="div" count={filtered.length} rowsPerPage={size} page={safePage} onPageChange={(_, value) => setPage(value)} onRowsPerPageChange={event => { setSize(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} sx={{ borderTop: 1, borderColor: 'divider', '& .MuiTablePagination-toolbar': { flexWrap: 'wrap', justifyContent: 'flex-end', px: 1 }, '& .MuiTablePagination-spacer': { display: 'none' } }} />}
    <Menu anchorEl={menu?.anchor} open={!!menu} onClose={() => setMenu(null)}>{actions.map(action => <MenuItem key={action.label} sx={{ color: action.danger ? 'error.main' : undefined }} onClick={() => { if (menu) action.run(menu.item); setMenu(null); }}>{action.label}</MenuItem>)}</Menu>
  </Paper>;
}
