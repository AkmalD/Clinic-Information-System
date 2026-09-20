import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Box, IconButton, Avatar, Menu, MenuItem, Divider, InputBase, Badge, Chip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SearchIcon from '@mui/icons-material/Search';
import ScheduleIcon from '@mui/icons-material/Schedule';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 260;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon fontSize="small" />, roles: ['ADMIN', 'PETUGAS', 'DOKTER', 'FARMASI'] },
  { label: 'Pasien', path: '/patients', icon: <PeopleIcon fontSize="small" />, roles: ['ADMIN', 'PETUGAS', 'DOKTER'] },
  { label: 'Pendaftaran & Antrean', path: '/registrations', icon: <EventNoteIcon fontSize="small" />, roles: ['ADMIN', 'PETUGAS', 'DOKTER'] },
  { label: 'Pemeriksaan', path: '/medical-records', icon: <MedicalServicesIcon fontSize="small" />, roles: ['ADMIN', 'DOKTER'] },
  { label: 'Dokter', path: '/doctors', icon: <LocalHospitalIcon fontSize="small" />, roles: ['ADMIN'] },
  { label: 'Akun & Role', path: '/users', icon: <ManageAccountsIcon fontSize="small" />, roles: ['ADMIN'] },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const visibleNavItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/patients?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Hitung shift saat ini berdasarkan jam operasional klinik
  const currentHour = new Date().getHours();
  let shiftLabel = 'Shift Pagi • 07:00 - 14:00 WIB';
  if (currentHour >= 14 && currentHour < 21) {
    shiftLabel = 'Shift Sore • 14:00 - 21:00 WIB';
  } else if (currentHour >= 21 || currentHour < 7) {
    shiftLabel = 'Shift Malam • Pelayanan Tutup';
  }

  const userInitials = (user?.namaLengkap || 'Admin')
    .replace(/^(dr|drg)\.\s*/i, '')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'AD';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F8F6' }}>
      {/* Top Header Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#FFFFFF',
          color: '#121E1A',
          borderBottom: '1px solid rgba(27, 77, 62, 0.08)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 }, minHeight: 64 }}>
          {/* Search Box */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#F4F8F6',
              border: '1px solid #D1DED8',
              borderRadius: 50,
              px: 2,
              py: 0.6,
              width: { xs: 200, sm: 360, md: 420 },
              transition: 'border-color 0.2s ease',
              '&:focus-within': {
                borderColor: '#1B4D3E',
                bgcolor: '#FFFFFF',
              },
            }}
          >
            <SearchIcon sx={{ color: '#707974', mr: 1, fontSize: 20 }} />
            <InputBase
              placeholder="Cari Pasien (No. RM, NIK, Nama)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              sx={{ fontSize: 13, color: '#121E1A', width: '100%' }}
            />
          </Box>

          {/* Right Header Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Shift Badge */}
            <Chip
              icon={<ScheduleIcon sx={{ fontSize: 16, color: '#136B53 !important' }} />}
              label={shiftLabel}
              size="small"
              sx={{
                bgcolor: '#E8F2EE',
                color: '#136B53',
                border: '1px solid #A0F0D1',
                fontWeight: 600,
                fontSize: 12,
                display: { xs: 'none', md: 'flex' },
                borderRadius: 50,
                px: 0.5,
              }}
            />

            {/* Notification Bell */}
            <IconButton
              size="small"
              sx={{
                bgcolor: '#F4F8F6',
                border: '1px solid rgba(27, 77, 62, 0.12)',
                color: '#404945',
                '&:hover': { bgcolor: '#E8F2EE' },
              }}
            >
              <Badge variant="dot" color="error" overlap="circular">
                <NotificationsNoneIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>

            {/* User Profile */}
            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                p: 0.5,
                borderRadius: 2,
                '&:hover': { bgcolor: '#F4F8F6' },
              }}
            >
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13, color: '#121E1A', lineHeight: 1.2 }}>
                  {user?.namaLengkap || 'Administrator'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, mt: 0.2 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#166534' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 10, color: '#526B62', letterSpacing: 0.5 }}>
                    {user?.role ? `${user.role} CLINIC` : 'ADMINISTRATOR CLINIC'}
                  </Typography>
                </Box>
              </Box>

              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: '#003629',
                  color: '#A0F0D1',
                  fontWeight: 700,
                  fontSize: 14,
                  border: '2px solid #A0F0D1',
                }}
              >
                {userInitials}
              </Avatar>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                elevation: 3,
                sx: { borderRadius: 3, minWidth: 200, mt: 1.5, p: 1 },
              }}
            >
              <MenuItem disabled sx={{ opacity: '1 !important' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>{user?.namaLengkap}</Typography>
                  <Typography variant="caption" color="text.secondary">@{user?.username} • {user?.role}</Typography>
                </Box>
              </MenuItem>
              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={handleLogout} sx={{ color: '#DC2626', borderRadius: 2 }}>
                <ListItemIcon sx={{ color: '#DC2626' }}><LogoutIcon fontSize="small" /></ListItemIcon>
                Keluar Sistem
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(27, 77, 62, 0.08)',
            bgcolor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
      >
        {/* Top: Logo & Menus */}
        <Box>
          {/* Logo & Klinik Name */}
          <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                bgcolor: '#003629',
                color: '#A0F0D1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 22,
              }}
            >
              ✚
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, letterSpacing: 0.8, color: '#121E1A', fontSize: 13, lineHeight: 1.1 }}>
                PRATAMA
              </Typography>
              <Typography variant="caption" sx={{ color: '#526B62', fontSize: 10, fontWeight: 700, letterSpacing: 0.2 }}>
                KLINIK PRATAMA RAWAT JALAN
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2, borderColor: 'rgba(27, 77, 62, 0.06)' }} />

          {/* Navigation List */}
          <List sx={{ px: 1.5 }}>
            {visibleNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItemButton
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    borderRadius: 3,
                    mb: 0.8,
                    py: 1.1,
                    px: 1.8,
                    bgcolor: isActive ? '#A7F3D0' : 'transparent',
                    color: isActive ? '#003629' : '#404945',
                    fontWeight: isActive ? 700 : 500,
                    '&:hover': {
                      bgcolor: isActive ? '#86EFAC' : '#EFFDF6',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isActive ? '#003629' : '#526B62',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 13.5,
                      fontWeight: isActive ? 700 : 600,
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        {/* Bottom: Helpdesk Card & Logout */}
        <Box sx={{ p: 2 }}>
          {/* Helpdesk IT Klinik Card */}
          <Box
            sx={{
              bgcolor: '#E8F2EE',
              border: '1px solid #A0F0D1',
              borderRadius: 3,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: '#A0F0D1',
                color: '#136B53',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PhoneInTalkIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 12, color: '#136B53', lineHeight: 1.2 }}>
                Helpdesk IT Klinik
              </Typography>
              <Typography variant="caption" sx={{ fontSize: 10.5, color: '#1B4D3E', fontWeight: 600 }}>
                Ext. 104 (07:00 - 21:00)
              </Typography>
            </Box>
          </Box>

          {/* Keluar Sistem */}
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 3,
              py: 1,
              px: 1.5,
              color: '#BA1A1A',
              '&:hover': { bgcolor: '#FFDAD6' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: '#BA1A1A' }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Keluar Sistem"
              primaryTypographyProps={{ fontSize: 13, fontWeight: 700 }}
            />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}