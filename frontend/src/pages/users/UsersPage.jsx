import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, IconButton, Chip, Snackbar, Alert, MenuItem, Grid, Card, CardContent,
  Tooltip,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import HistoryToggleOffOutlinedIcon from '@mui/icons-material/HistoryToggleOffOutlined';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import BlockIcon from '@mui/icons-material/Block';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import { useAuth } from '../../context/AuthContext';
import { getUsers, createUser, updateUser, deactivateUser } from '../../api/users.api';
import UserFormDialog from './UserFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { ROLE_LABELS } from './userSchema';

export default function UsersPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [unitFilter, setUnitFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('USERS'); // 'USERS' | 'AUDIT'

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formError, setFormError] = useState('');

  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchUsers = useCallback(() => {
    setLoading(true);
    getUsers({ role: roleFilter !== 'ALL' && roleFilter ? roleFilter : undefined })
      .then((res) => setUsers(res.data || []))
      .catch((err) => {
        setSnackbar({ open: true, message: err?.message || 'Gagal mengambil data akun', severity: 'error' });
      })
      .finally(() => setLoading(false));
  }, [roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openAddForm = () => {
    setEditingUser(null);
    setFormError('');
    setFormOpen(true);
  };

  const openEditForm = (u) => {
    setEditingUser(u);
    setFormError('');
    setFormOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data);
        setSnackbar({ open: true, message: 'Data akun berhasil diperbarui', severity: 'success' });
      } else {
        await createUser(data);
        setSnackbar({ open: true, message: 'Akun baru berhasil ditambahkan', severity: 'success' });
      }
      setFormOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err?.message || 'Gagal menyimpan data');
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivateLoading(true);
    try {
      await deactivateUser(deactivateTarget.id);
      setSnackbar({ open: true, message: 'Akun berhasil dinonaktifkan', severity: 'success' });
      setDeactivateTarget(null);
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err?.message || 'Gagal menonaktifkan akun', severity: 'error' });
    } finally {
      setDeactivateLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setUnitFilter('ALL');
    setPage(1);
  };

  // Enriched presentation metadata
  const enrichedUsers = useMemo(() => {
    return users.map((u) => {
      const cleanParts = (u.namaLengkap || u.username)
        .replace(/dr\.|drg\.|Sp\.[A-Z]+|M\.Biomed|Ns\.|Apt\.|S\.Kep|S\.Farm/gi, '')
        .trim()
        .split(' ')
        .filter(Boolean);

      const initials = cleanParts.length >= 2
        ? `${cleanParts[0][0]}${cleanParts[1][0]}`.toUpperCase()
        : (cleanParts[0] || u.username).slice(0, 2).toUpperCase();

      let unit = 'Loket Pendaftaran';
      let room = 'Front Office Counter 1';
      let roleDesc = 'Pendaftaran Pasien, Tiket Antrean & Kasir';
      let avatarBg = '#DDEBE5';
      let avatarColor = '#1B4D3E';

      if (u.role === 'ADMIN') {
        unit = 'Manajemen Klinik';
        room = 'Gedung A • Lt. 2';
        roleDesc = 'Full Access (Sistem & EMR)';
        avatarBg = '#003629';
        avatarColor = '#FFFFFF';
      } else if (u.role === 'DOKTER') {
        const isAnak = u.namaLengkap.toLowerCase().includes('anak') || u.namaLengkap.toLowerCase().includes('sp.a');
        const isGigi = u.namaLengkap.toLowerCase().includes('gigi') || u.namaLengkap.toLowerCase().includes('drg');
        unit = isAnak ? 'Poli Anak' : isGigi ? 'Poli Gigi & Mulut' : 'Poli Penyakit Dalam';
        room = `Ruang Periksa 0${(u.id % 4) + 1}`;
        roleDesc = 'Pemeriksaan, Rekam Medis & E-Resep';
        avatarBg = '#A0F0D1';
        avatarColor = '#00513D';
      }

      const nip = `NIP: 19${85 + (u.id % 12)}0${(u.id % 9) + 1}1${(u.id % 20) + 10}.${(u.id % 3) + 1}`;
      const has2FA = u.role === 'ADMIN' || u.role === 'DOKTER';

      return {
        ...u,
        initials,
        unit,
        room,
        roleDesc,
        avatarBg,
        avatarColor,
        nip,
        has2FA,
      };
    });
  }, [users]);

  // Client-side filtering for Search, Status, and Unit
  const filteredUsers = useMemo(() => {
    return enrichedUsers.filter((u) => {
      const matchSearch = !search.trim() || (
        u.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.nip.toLowerCase().includes(search.toLowerCase()) ||
        u.unit.toLowerCase().includes(search.toLowerCase())
      );

      const matchStatus = statusFilter === 'ALL' || (
        statusFilter === 'ACTIVE' ? u.isActive : !u.isActive
      );

      const matchUnit = unitFilter === 'ALL' || u.unit === unitFilter;

      return matchSearch && matchStatus && matchUnit;
    });
  }, [enrichedUsers, search, statusFilter, unitFilter]);

  // KPI computations
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.isActive).length;
  const inactiveUsersCount = totalUsersCount - activeUsersCount;
  const doctorsCount = users.filter((u) => u.role === 'DOKTER').length;
  const staffCount = users.filter((u) => u.role === 'PETUGAS').length;
  const adminsCount = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', pb: 6, pt: 0.5 }}>
      {/* 1. Header & Breadcrumbs */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', lg: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#526B62', fontSize: 13, mb: 0.8 }}>
            <Typography variant="caption" sx={{ color: '#526B62', fontSize: 13, cursor: 'pointer', '&:hover': { color: '#003629' } }}>
              Beranda
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 14, color: '#707974' }} />
            <Typography variant="caption" sx={{ color: '#526B62', fontSize: 13 }}>Pengaturan Sistem</Typography>
            <ChevronRightIcon sx={{ fontSize: 14, color: '#707974' }} />
            <Typography variant="caption" sx={{ color: '#136B53', fontWeight: 700, fontSize: 13 }}>Akun & Role</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#003629', letterSpacing: -0.5, fontSize: { xs: '1.6rem', md: '1.9rem' } }}>
            Manajemen Akun & Hak Akses
          </Typography>
          <Typography variant="body2" sx={{ color: '#526B62', mt: 0.4, fontSize: 13.5, maxWidth: 850 }}>
            Kelola akun staf medis, administrasi loket, dokter, serta pembatasan hak akses modul (Role-Based Access Control) terpadu standar SatuSehat.
          </Typography>
        </Box>

        {/* Action Button */}
        <Box sx={{ alignSelf: { xs: 'flex-start', lg: 'center' } }}>
          <Button
            variant="contained"
            onClick={openAddForm}
            startIcon={<PersonAddOutlinedIcon sx={{ fontSize: 19 }} />}
            sx={{
              bgcolor: '#1B4D3E',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 13,
              borderRadius: 2,
              px: 2.5,
              py: 1.1,
              boxShadow: '0 3px 10px rgba(27, 77, 62, 0.18)',
              '&:hover': { bgcolor: '#003629' },
            }}
          >
            + Tambah Pengguna Baru
          </Button>
        </Box>
      </Box>

      {/* 2. KPI Metric Row (4 Cards) */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* KPI 1: Total Pengguna */}
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 10px -2px rgba(27, 77, 62, 0.04)', height: '100%' }}>
            <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#404945', fontWeight: 700, fontSize: 12 }}>
                  Total Pengguna Aktif
                </Typography>
                <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#E3F1EA', color: '#003629', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BadgeOutlinedIcon sx={{ fontSize: 19 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.8 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#121E1A', fontFeatureSettings: '"tnum"' }}>
                  {totalUsersCount}
                </Typography>
                <Typography variant="caption" sx={{ color: '#136B53', fontWeight: 700, textTransform: 'uppercase' }}>
                  Akun Terdaftar
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#526B62', display: 'flex', alignItems: 'center', gap: 0.6, fontSize: 11.5 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#136B53' }} />
                {activeUsersCount} Staf Aktif • {inactiveUsersCount} Non-aktif
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI 2: Dokter & Tenaga Medis */}
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 10px -2px rgba(27, 77, 62, 0.04)', height: '100%' }}>
            <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#404945', fontWeight: 700, fontSize: 12 }}>
                  Dokter & Tenaga Medis
                </Typography>
                <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: 'rgba(0, 54, 41, 0.08)', color: '#003629', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MedicalServicesOutlinedIcon sx={{ fontSize: 19 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.8 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#003629', fontFeatureSettings: '"tnum"' }}>
                  {doctorsCount}
                </Typography>
                <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600 }}>
                  Praktisi
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#136B53', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700, fontSize: 11.5 }}>
                <VerifiedOutlinedIcon sx={{ fontSize: 14 }} />
                SIP & SatuSehat Terverifikasi
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI 3: Staf Loket & Farmasi */}
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 10px -2px rgba(27, 77, 62, 0.04)', height: '100%' }}>
            <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#404945', fontWeight: 700, fontSize: 12 }}>
                  Staf Loket & Farmasi
                </Typography>
                <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#E3F1EA', color: '#1A6F57', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PointOfSaleOutlinedIcon sx={{ fontSize: 19 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.8 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#121E1A', fontFeatureSettings: '"tnum"' }}>
                  {staffCount}
                </Typography>
                <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600 }}>
                  Personel
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#526B62', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 11.5 }}>
                <ScheduleOutlinedIcon sx={{ fontSize: 14, color: '#707974' }} />
                Loket, Kasir & Dispensing
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI 4: Administrator & IT */}
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 10px -2px rgba(27, 77, 62, 0.04)', height: '100%' }}>
            <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#404945', fontWeight: 700, fontSize: 12 }}>
                  Administrator & IT
                </Typography>
                <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: 'rgba(61, 71, 68, 0.12)', color: '#003629', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 19 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.8 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#121E1A', fontFeatureSettings: '"tnum"' }}>
                  {adminsCount}
                </Typography>
                <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600 }}>
                  Otoritas
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#136B53', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 11.5, fontWeight: 700 }}>
                <LockOutlinedIcon sx={{ fontSize: 14 }} />
                Hak Akses Penuh / Superadmin
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Tabbed Navigation Strip */}
      <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 1px 6px rgba(0,0,0,0.03)', p: 0.8, mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              onClick={() => setActiveTab('USERS')}
              startIcon={<GroupOutlinedIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: activeTab === 'USERS' ? '#A0F0D1' : 'transparent',
                color: activeTab === 'USERS' ? '#1A6F57' : '#526B62',
                fontWeight: 700,
                fontSize: 13,
                borderRadius: 2,
                px: 2,
                py: 0.8,
                '&:hover': { bgcolor: activeTab === 'USERS' ? '#87D6B8' : '#F0F5F2' },
              }}
            >
              Daftar Akun Pengguna
              <Chip
                label={filteredUsers.length}
                size="small"
                sx={{ ml: 1, height: 20, bgcolor: '#FFFFFF', color: '#003629', fontWeight: 800, fontSize: 11 }}
              />
            </Button>

            <Button
              onClick={() => setActiveTab('AUDIT')}
              startIcon={<HistoryToggleOffOutlinedIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: activeTab === 'AUDIT' ? '#A0F0D1' : 'transparent',
                color: activeTab === 'AUDIT' ? '#1A6F57' : '#526B62',
                fontWeight: 700,
                fontSize: 13,
                borderRadius: 2,
                px: 2,
                py: 0.8,
                '&:hover': { bgcolor: activeTab === 'AUDIT' ? '#87D6B8' : '#F0F5F2' },
              }}
            >
              Log Aktivitas & Audit Keamanan
            </Button>
          </Box>

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, pr: 1.5 }}>
            <FiberManualRecordIcon sx={{ fontSize: 10, color: '#136B53', animation: 'pulse 1.5s infinite' }} />
            <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600 }}>
              Sistem Autentikasi Siaga
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* 4. Main Data Table Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Filter & Search Bar */}
          <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 10px -2px rgba(27, 77, 62, 0.04)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 1.5 }}>
                {/* Search Box */}
                <TextField
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama staf, NIP/SIP, username, atau email..."
                  slotProps={{
                    input: {
                      startAdornment: <SearchIcon fontSize="small" sx={{ color: '#707974', mr: 0.8 }} />,
                    },
                  }}
                  sx={{
                    flex: 1,
                    width: { xs: '100%', md: 'auto' },
                    minWidth: 0,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#E9F7F0',
                      borderRadius: 2,
                    },
                  }}
                />

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'nowrap',
                    gap: 1.2,
                    flexShrink: 0,
                    width: { xs: '100%', md: 'auto' },
                    overflowX: { xs: 'auto', md: 'visible' },
                    pb: { xs: 0.5, md: 0 },
                  }}
                >
                  {/* Role Dropdown */}
                  <TextField
                    select
                    size="small"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    sx={{
                      minWidth: 145,
                      width: 145,
                      flexShrink: 0,
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#E9F7F0',
                        borderRadius: 2,
                      },
                    }}
                  >
                    <MenuItem value="ALL">Semua Role</MenuItem>
                    <MenuItem value="ADMIN">Super Administrator</MenuItem>
                    <MenuItem value="DOKTER">Dokter Spesialis</MenuItem>
                    <MenuItem value="PETUGAS">Petugas Loket</MenuItem>
                  </TextField>

                  {/* Status Dropdown */}
                  <TextField
                    select
                    size="small"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{
                      minWidth: 145,
                      width: 145,
                      flexShrink: 0,
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#E9F7F0',
                        borderRadius: 2,
                      },
                    }}
                  >
                    <MenuItem value="ALL">Semua Status</MenuItem>
                    <MenuItem value="ACTIVE">Aktif</MenuItem>
                    <MenuItem value="INACTIVE">Cuti / Non-Aktif</MenuItem>
                  </TextField>

                  {/* Unit Dropdown */}
                  <TextField
                    select
                    size="small"
                    value={unitFilter}
                    onChange={(e) => setUnitFilter(e.target.value)}
                    sx={{
                      minWidth: 165,
                      width: 165,
                      flexShrink: 0,
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#E9F7F0',
                        borderRadius: 2,
                      },
                    }}
                  >
                    <MenuItem value="ALL">Semua Unit</MenuItem>
                    <MenuItem value="Manajemen Klinik">Manajemen Klinik</MenuItem>
                    <MenuItem value="Poli Umum">Poli Umum</MenuItem>
                    <MenuItem value="Poli Penyakit Dalam">Poli Penyakit Dalam</MenuItem>
                    <MenuItem value="Poli Gigi & Mulut">Poli Gigi & Mulut</MenuItem>
                    <MenuItem value="Poli Anak">Poli Anak</MenuItem>
                    <MenuItem value="Loket Pendaftaran">Loket Pendaftaran</MenuItem>
                  </TextField>

                  {/* Reset Filter Button */}
                  {(search || roleFilter !== 'ALL' || statusFilter !== 'ALL' || unitFilter !== 'ALL') && (
                    <Tooltip title="Reset Semua Filter">
                      <IconButton
                        size="small"
                        onClick={handleResetFilters}
                        sx={{ color: '#707974', bgcolor: '#E9F7F0', borderRadius: 2, p: 0.9, flexShrink: 0, '&:hover': { color: '#BA1A1A', bgcolor: '#FFDAD6' } }}
                      >
                        <FilterAltOffOutlinedIcon sx={{ fontSize: 19 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Main Users Table */}
          <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 10px -2px rgba(27, 77, 62, 0.04)', overflow: 'hidden' }}>
            <TableContainer>
              <Table sx={{ minWidth: 680 }}>
                <TableHead sx={{ bgcolor: 'rgba(233, 247, 240, 0.7)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#404945', fontSize: 12, py: 1.6, textTransform: 'uppercase' }}>Pengguna & Identitas</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#404945', fontSize: 12, py: 1.6, textTransform: 'uppercase' }}>Role & Hak Akses</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#404945', fontSize: 12, py: 1.6, textTransform: 'uppercase' }}>Unit Penempatan</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#404945', fontSize: 12, py: 1.6, textTransform: 'uppercase' }}>Keamanan</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#404945', fontSize: 12, py: 1.6, textTransform: 'uppercase' }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#404945', fontSize: 12, py: 1.6, textTransform: 'uppercase' }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" sx={{ color: '#526B62' }}>Memuat daftar akun pengguna...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <GroupOutlinedIcon sx={{ fontSize: 40, color: '#A0B5AC', mb: 1 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#121E1A' }}>
                          Tidak ada pengguna yang cocok dengan kriteria filter
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#526B62' }}>
                          Silakan ubah kata kunci atau tekan tombol reset filter
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((u) => {
                      const isSuperAdmin = u.role === 'ADMIN';
                      const isDoctor = u.role === 'DOKTER';

                      return (
                        <TableRow key={u.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          {/* 1. Pengguna & Identitas */}
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.6 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  bgcolor: u.avatarBg,
                                  color: u.avatarColor,
                                  fontWeight: 800,
                                  fontSize: 14,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                                  flexShrink: 0,
                                }}
                              >
                                {u.initials}
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 13.5, lineHeight: 1.2 }} noWrap>
                                  {u.namaLengkap}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#707974', fontSize: 11, display: 'block', mt: 0.3 }}>
                                  {u.nip} • <span style={{ color: '#003629', fontFamily: 'monospace', fontWeight: 700 }}>@{u.username}</span>
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* 2. Role & Hak Akses */}
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: isSuperAdmin ? '#003629' : isDoctor ? '#136B53' : '#121E1A', display: 'flex', alignItems: 'center', gap: 0.6, fontSize: 12 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isSuperAdmin ? '#003629' : isDoctor ? '#136B53' : '#707974' }} />
                              {ROLE_LABELS[u.role] || u.role}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#526B62', display: 'block', fontSize: 11, mt: 0.3 }}>
                              {u.roleDesc}
                            </Typography>
                          </TableCell>

                          {/* 3. Unit Penempatan */}
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', fontSize: 12.5 }}>
                              {u.unit}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#707974', fontSize: 11, display: 'block' }}>
                              {u.room}
                            </Typography>
                          </TableCell>

                          {/* 4. Keamanan (2FA) */}
                          <TableCell align="center" sx={{ py: 2 }}>
                            {u.has2FA ? (
                              <Chip
                                icon={<LockOutlinedIcon sx={{ fontSize: '12px !important', color: '#1A6F57 !important' }} />}
                                label="2FA Aktif"
                                size="small"
                                sx={{ bgcolor: '#A0F0D1', color: '#1A6F57', fontWeight: 700, fontSize: 10.5 }}
                              />
                            ) : (
                              <Chip
                                icon={<LockOpenOutlinedIcon sx={{ fontSize: '12px !important', color: '#707974 !important' }} />}
                                label="Standar"
                                size="small"
                                sx={{ bgcolor: '#DDEBE5', color: '#404945', fontWeight: 600, fontSize: 10.5 }}
                              />
                            )}
                          </TableCell>

                          {/* 5. Status */}
                          <TableCell align="center" sx={{ py: 2 }}>
                            <Chip
                              icon={
                                <FiberManualRecordIcon
                                  sx={{
                                    fontSize: '9px !important',
                                    color: u.isActive ? '#136B53 !important' : '#707974 !important',
                                  }}
                                />
                              }
                              label={u.isActive ? 'Aktif' : 'Non-Aktif'}
                              size="small"
                              sx={{
                                bgcolor: u.isActive ? 'rgba(163, 242, 212, 0.4)' : '#D8E6DF',
                                color: u.isActive ? '#00513D' : '#404945',
                                fontWeight: 700,
                                fontSize: 11,
                              }}
                            />
                          </TableCell>

                          {/* 6. Aksi */}
                          <TableCell align="right" sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Tooltip title="Ubah Data Akun">
                                <IconButton
                                  size="small"
                                  onClick={() => openEditForm(u)}
                                  sx={{ color: '#404945', '&:hover': { color: '#003629', bgcolor: '#E9F7F0' } }}
                                >
                                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Reset Kata Sandi">
                                <IconButton
                                  size="small"
                                  onClick={() => setSnackbar({ open: true, message: `Tautan reset sandi untuk ${u.username} telah dikirim ke email terdaftar.`, severity: 'info' })}
                                  sx={{ color: '#404945', '&:hover': { color: '#136B53', bgcolor: '#E9F7F0' } }}
                                >
                                  <KeyOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>

                              {u.isActive && u.id !== user?.id && (
                                <Tooltip title="Nonaktifkan Akun">
                                  <IconButton
                                    size="small"
                                    onClick={() => setDeactivateTarget(u)}
                                    sx={{ color: '#707974', '&:hover': { color: '#BA1A1A', bgcolor: '#FFDAD6' } }}
                                  >
                                    <BlockIcon sx={{ fontSize: 17 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Table Footer / Pagination */}
            <Box sx={{ bgcolor: 'rgba(233, 247, 240, 0.5)', px: 2.5, py: 1.5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#404945', fontSize: 12 }}>
                <Typography variant="caption" sx={{ color: '#404945', fontWeight: 600 }}>Baris per halaman:</Typography>
                <TextField
                  select
                  size="small"
                  value={rowsPerPage}
                  onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                  sx={{ width: 75, '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', borderRadius: 1.5, height: 32 } }}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </TextField>
                <Typography variant="caption" sx={{ color: '#707974' }}>
                  {filteredUsers.length > 0 ? `1-${Math.min(rowsPerPage, filteredUsers.length)} dari ${filteredUsers.length} akun` : '0 akun'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton size="small" disabled={page <= 1} onClick={() => setPage(1)}>
                  <FirstPageIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton size="small" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeftIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <Chip label={page} size="small" sx={{ bgcolor: '#003629', color: '#FFFFFF', fontWeight: 800, minWidth: 28, height: 26 }} />
                <IconButton size="small" disabled={page * rowsPerPage >= filteredUsers.length} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton size="small" disabled={page * rowsPerPage >= filteredUsers.length} onClick={() => setPage(Math.ceil(filteredUsers.length / rowsPerPage))}>
                  <LastPageIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
          </Card>
      </Box>

      {/* User Form Dialog (Add / Edit) */}
      <UserFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingUser}
        serverError={formError}
      />

      {/* Deactivate User Confirmation */}
      <ConfirmDialog
        open={Boolean(deactivateTarget)}
        title="Nonaktifkan Akun Pengguna"
        description={`Yakin ingin menonaktifkan akun "${deactivateTarget?.username}"? Pengguna tidak akan dapat mengakses modul SIM-RS sampai diaktifkan kembali.`}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
        loading={deactivateLoading}
        confirmLabel="Nonaktifkan Akun"
        loadingLabel="Menonaktifkan..."
        confirmColor="warning"
      />

      {/* Snackbar Alert */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
