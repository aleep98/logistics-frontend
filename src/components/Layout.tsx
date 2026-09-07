import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Avatar, Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import { DashboardRounded, LocalShippingRounded, DirectionsCarRounded, LogoutRounded, AdminPanelSettingsRounded, MenuRounded, ChevronLeftRounded, DarkModeOutlined, LightModeOutlined, CloseRounded } from '@mui/icons-material';
import { isAdmin } from '../auth/session';
import { usePreferences } from '../themes/preferences';

export default function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { mode, toggleTheme } = usePreferences();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const width = collapsed ? 84 : 252;
  let user = { name: 'Usuário', role: '' };
  try { user = JSON.parse(localStorage.getItem('user') || 'null') || user; } catch { /* Use the default label. */ }
  const items = [
    { text: 'Visão geral', path: '/dashboard', icon: <DashboardRounded /> },
    { text: 'Remessas', path: '/shipments', icon: <LocalShippingRounded /> },
    { text: 'Veículos', path: '/vehicles', icon: <DirectionsCarRounded /> },
    ...(isAdmin() ? [{ text: 'Administração', path: '/admin', icon: <AdminPanelSettingsRounded /> }] : []),
  ];
  const title = items.find(item => pathname.startsWith(item.path))?.text || 'Visão geral';
  const sidebar = (compact: boolean) => <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2, bgcolor: '#141c30', color: '#e8edf9' }}>
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: 56, mb: 4, px: 0.5 }}>
      <Avatar variant="rounded" sx={{ bgcolor: '#675df4', width: 42, height: 42 }}><LocalShippingRounded /></Avatar>
      {!compact && <Box><Typography fontWeight={800} fontSize={19}>Logística</Typography><Typography fontSize={10} sx={{ color: '#a6b1cb', letterSpacing: 2 }}>GESTÃO DE OPERAÇÕES</Typography></Box>}
    </Stack>
    {!compact && <Typography sx={{ px: 1.5, color: '#8f9bb6', fontSize: 10, letterSpacing: 1.5, fontWeight: 700 }}>OPERAÇÃO</Typography>}
    <List sx={{ mt: 1 }}>
      {items.map(item => <Tooltip key={item.path} title={compact ? item.text : ''} placement="right">
        <ListItemButton aria-label={item.text} selected={pathname.startsWith(item.path)} onClick={() => { navigate(item.path); setMobileOpen(false); }} sx={{ my: 0.7, px: 1.5, minHeight: 46, '&.Mui-selected': { color: '#c9c5ff', bgcolor: '#2d3052' } }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: compact ? 0 : 38 }}>{item.icon}</ListItemIcon>
          {!compact && <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />}
        </ListItemButton>
      </Tooltip>)}
    </List>
    <Box sx={{ flexGrow: 1 }} />
    <Divider sx={{ borderColor: '#30394f', mb: 2 }} />
    <Tooltip title="Sair da conta" placement="right"><ListItemButton aria-label="Sair da conta" onClick={() => { localStorage.removeItem('authToken'); localStorage.removeItem('user'); navigate('/login'); }}>
      <ListItemIcon sx={{ color: '#a6b1cb', minWidth: compact ? 0 : 38 }}><LogoutRounded /></ListItemIcon>
      {!compact && <ListItemText primary="Sair da conta" primaryTypographyProps={{ fontSize: 14 }} />}
    </ListItemButton></Tooltip>
  </Box>;
  return <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    <Box component="a" href="#main-content" sx={{ position: 'fixed', left: 12, top: -80, zIndex: 1500, bgcolor: 'background.paper', p: 2, '&:focus': { top: 12 } }}>Pular para o conteúdo</Box>
    <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, width, flexShrink: 0, '& .MuiDrawer-paper': { width, border: 0 } }}>{sidebar(collapsed)}</Drawer>
    <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { width: 270 } }}>
      <IconButton aria-label="Fechar menu" onClick={() => setMobileOpen(false)} sx={{ position: 'absolute', right: 4, top: 0, color: '#fff' }}><CloseRounded /></IconButton>{sidebar(false)}
    </Drawer>
    <AppBar position="fixed" color="inherit" elevation={0} sx={{ width: { md: `calc(100% - ${width}px)` }, ml: { md: `${width}px` }, borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 2 }}>
        <IconButton aria-label="Abrir menu" onClick={() => setMobileOpen(true)} sx={{ display: { md: 'none' } }}><MenuRounded /></IconButton>
        <IconButton aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'} onClick={() => setCollapsed(!collapsed)} sx={{ display: { xs: 'none', md: 'inline-flex' } }}>{collapsed ? <MenuRounded /> : <ChevronLeftRounded />}</IconButton>
        <Typography fontWeight={600} fontSize={14} sx={{ flexGrow: 1 }}>{title}</Typography>
        <Tooltip title={mode === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}><IconButton aria-label={mode === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'} onClick={toggleTheme}>{mode === 'light' ? <DarkModeOutlined /> : <LightModeOutlined />}</IconButton></Tooltip>
        <Divider orientation="vertical" flexItem sx={{ my: 2 }} />
        <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}><Typography fontSize={13} fontWeight={700}>{user.name}</Typography><Typography fontSize={11} color="text.secondary">{user.role === 'admin' ? 'Administrador' : user.role === 'dispatcher' ? 'Operador' : 'Motorista'}</Typography></Box>
        <Avatar sx={{ width: 36, height: 36, fontSize: 14, bgcolor: '#edeaff', color: '#5549c9', fontWeight: 700 }}>{user.name?.slice(0, 2).toUpperCase()}</Avatar>
      </Toolbar>
    </AppBar>
    <Box component="main" id="main-content" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, sm: 3, lg: 4 } }}><Toolbar /><Box sx={{ maxWidth: 1600, mx: 'auto' }}>{children}</Box></Box>
  </Box>;
}
