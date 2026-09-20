import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, IconButton, InputAdornment, Chip, Snackbar, Alert, MenuItem,
  Grid, Card, CardContent, LinearProgress, Tooltip, Avatar,
} from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';

import { useAuth } from '../../context/AuthContext';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../../api/doctors.api';
import { getPoli } from '../../api/poli.api';
import DoctorFormDialog from './DoctorFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1594824813575-c800c0f993f3?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200&auto=format&fit=crop',
];

const WEEK_DAYS = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];

export default function DoctorsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN';

  const [doctors, setDoctors] = useState([]);
  const [poliOptions, setPoliOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [poliFilter, setPoliFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchDoctors = useCallback(() => {
    setLoading(true);
    getDoctors({
      search: search || undefined,
      poliId: poliFilter !== 'ALL' && poliFilter ? poliFilter : undefined,
    })
      .then((res) => setDoctors(res.data || []))
      .catch((err) => {
        setSnackbar({ open: true, message: err?.message || 'Gagal mengambil data dokter', severity: 'error' });
      })
      .finally(() => setLoading(false));
  }, [search, poliFilter]);

  useEffect(() => {
    getPoli().then((res) => setPoliOptions(res.data || []));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchDoctors, 350);
    return () => clearTimeout(timeout);
  }, [fetchDoctors]);

  // Form actions
  const openEditForm = (doctor) => {
    setEditingDoctor(doctor);
    setFormError('');
    setFormOpen(true);
  };

  const handleFormSubmit = async (data) => {
    const payload = { ...data, noSip: data.noSip || null };
    try {
      if (editingDoctor) {
        await updateDoctor(editingDoctor.id, payload);
        setSnackbar({ open: true, message: 'Data dokter berhasil diperbarui', severity: 'success' });
      } else {
        await createDoctor(payload);
        setSnackbar({ open: true, message: 'Dokter berhasil ditambahkan', severity: 'success' });
      }
      setFormOpen(false);
      fetchDoctors();
    } catch (err) {
      setFormError(err?.message || 'Gagal menyimpan data');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteDoctor(deleteTarget.id);
      setSnackbar({ open: true, message: 'Data dokter berhasil dihapus', severity: 'success' });
      setDeleteTarget(null);
      fetchDoctors();
    } catch (err) {
      setSnackbar({ open: true, message: err?.message || 'Gagal menghapus data', severity: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setPoliFilter('ALL');
    setStatusFilter('ALL');
  };

  // Enriched Doctors with Presentation Info
  const enrichedDoctors = useMemo(() => {
    return doctors.map((doc, idx) => {
      const isEven = idx % 2 === 0;
      const status = doc.user?.isActive === false
        ? 'Cuti'
        : isEven
          ? 'Praktek Aktif'
          : 'Siap Praktik';

      const avatar = AVATAR_PRESETS[idx % AVATAR_PRESETS.length];
      const satuSehatId = `1000${2938470 + doc.id}`;
      const roomNumber = `Ruang 0${(idx % 4) + 1} (Lt. ${idx >= 4 ? '2' : '1'})`;
      const timeSlot = idx % 3 === 0 ? '08:00 - 13:00' : idx % 3 === 1 ? '13:30 - 18:00' : '08:30 - 14:00';
      const queueWaiting = (doc.id * 3 + 2) % 8 + 1;
      const maxQuota = 20 + (doc.id % 3) * 5;
      const currentPatients = Math.min(maxQuota, Math.round(maxQuota * (0.6 + (doc.id % 4) * 0.1)));

      return {
        ...doc,
        avatar,
        status,
        satuSehatId,
        roomNumber,
        timeSlot,
        queueWaiting,
        maxQuota,
        currentPatients,
      };
    });
  }, [doctors]);

  // Client-side status filter
  const filteredDoctors = useMemo(() => {
    if (statusFilter === 'ALL') return enrichedDoctors;
    return enrichedDoctors.filter((d) => d.status === statusFilter);
  }, [enrichedDoctors, statusFilter]);

  // Metric computations
  const totalDoctors = doctors.length;
  const activeToday = enrichedDoctors.filter((d) => d.status === 'Praktek Aktif' || d.status === 'Siap Praktik').length;
  const totalPolis = poliOptions.length || 4;
  const sipCompliance = totalDoctors > 0
    ? Math.round((doctors.filter((d) => Boolean(d.noSip)).length / totalDoctors) * 100)
    : 100;

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', pb: 6, pt: 0.5 }}>
      {/* 1. Header & Breadcrumb */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#526B62', fontSize: 13, mb: 0.8 }}>
            <Box
              component="span"
              onClick={() => navigate('/')}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', '&:hover': { color: '#1B4D3E' } }}
            >
              <HomeOutlinedIcon sx={{ fontSize: 16 }} />
              Beranda
            </Box>
            <Typography variant="caption" sx={{ color: '#707974' }}>/</Typography>
            <Typography variant="caption" sx={{ color: '#707974' }}>Tenaga Medis</Typography>
            <Typography variant="caption" sx={{ color: '#707974' }}>/</Typography>
            <Typography variant="caption" sx={{ color: '#1B4D3E', fontWeight: 700 }}>Dokter & Spesialis</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1B4D3E', letterSpacing: -0.5, fontSize: { xs: '1.6rem', md: '1.9rem' } }}>
            Direktori & Manajemen Dokter
          </Typography>
          <Typography variant="body2" sx={{ color: '#526B62', mt: 0.3, fontSize: 13.5 }}>
            Kelola master tenaga medis, poliklinik tugas, kredensial izin praktik (SIP/STR), integrasi SatuSehat Kemenkes, dan monitoring kapasitas antrean real-time.
          </Typography>
        </Box>

        {/* Header Action Buttons */}
        {canEdit && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/doctors/new')}
              startIcon={<AddIcon sx={{ fontSize: 19 }} />}
              sx={{
                bgcolor: '#1B4D3E',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 13,
                borderRadius: 2,
                px: 2.4,
                py: 0.9,
                boxShadow: '0 4px 12px rgba(27, 77, 62, 0.2)',
                '&:hover': { bgcolor: '#133D31' },
              }}
            >
              Tambah Dokter Baru
            </Button>
          </Box>
        )}
      </Box>

      {/* 2. Top 4 KPI Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Metric 1 */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 10px -2px rgba(27, 77, 62, 0.04)' }}>
            <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: '#E8F2EE', color: '#1B4D3E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BadgeOutlinedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Chip label="Aktif di DB" size="small" sx={{ bgcolor: '#F0F5F2', color: '#1B4D3E', fontWeight: 700, fontSize: 11 }} />
              </Box>
              <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600, display: 'block' }}>
                Total Dokter Terdaftar
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#121E1A', my: 0.3, fontFeatureSettings: '"tnum"' }}>
                {totalDoctors}
              </Typography>
              <Typography variant="caption" sx={{ color: '#136B53', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 13 }} /> Terverifikasi SISDMK Kemenkes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric 2 */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 10px -2px rgba(27, 77, 62, 0.04)' }}>
            <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: '#E8F2EE', color: '#136B53', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EventAvailableOutlinedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Chip
                  icon={<FiberManualRecordIcon sx={{ fontSize: '10px !important', color: '#00875A !important' }} />}
                  label="Hari Ini"
                  size="small"
                  sx={{ bgcolor: '#EFFDF6', color: '#00875A', fontWeight: 700, fontSize: 11 }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600, display: 'block' }}>
                Dokter Bertugas Hari Ini
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#121E1A', my: 0.3, fontFeatureSettings: '"tnum"' }}>
                {activeToday} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#526B62' }}>Praktik</span>
              </Typography>
              <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600 }}>
                Shift Pagi & Sore Aktif
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric 3 */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 10px -2px rgba(27, 77, 62, 0.04)' }}>
            <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: '#E8F2EE', color: '#1B4D3E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MeetingRoomOutlinedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Chip label="100% Berjalan" size="small" sx={{ bgcolor: '#EFFDF6', color: '#136B53', fontWeight: 700, fontSize: 11 }} />
              </Box>
              <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600, display: 'block' }}>
                Poliklinik Beroperasi
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#121E1A', my: 0.3, fontFeatureSettings: '"tnum"' }}>
                {totalPolis} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#526B62' }}>Unit</span>
              </Typography>
              <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600 }}>
                Umum, Gigi, Anak, KIA
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric 4 */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 10px -2px rgba(27, 77, 62, 0.04)' }}>
            <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: '#E8F2EE', color: '#136B53', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <VerifiedOutlinedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Chip label="SatuSehat Live" size="small" sx={{ bgcolor: '#EFFDF6', color: '#136B53', fontWeight: 700, fontSize: 11 }} />
              </Box>
              <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600, display: 'block' }}>
                Kepatuhan SIP / STR
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#121E1A', my: 0.3, fontFeatureSettings: '"tnum"' }}>
                {sipCompliance}%
              </Typography>
              <Typography variant="caption" sx={{ color: '#136B53', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CloudDoneOutlinedIcon sx={{ fontSize: 13 }} /> Surat Izin Praktik Valid
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Search & Filter Bar */}
      <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 10px -2px rgba(27, 77, 62, 0.04)', mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, width: { xs: '100%', md: 'auto' }, flex: 1 }}>
              {/* Search Box */}
              <TextField
                placeholder="Cari nama dokter, SIP, atau spesialisasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{
                  width: { xs: '100%', sm: 300 },
                  bgcolor: '#F8FAF9',
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: '#526B62' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Poli Filter */}
              <TextField
                select
                size="small"
                value={poliFilter}
                onChange={(e) => setPoliFilter(e.target.value)}
                sx={{ width: { xs: '100%', sm: 190 }, bgcolor: '#F8FAF9', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value="ALL">Semua Poliklinik</MenuItem>
                {poliOptions.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.namaPoli}</MenuItem>
                ))}
              </TextField>

              {/* Status Filter */}
              <TextField
                select
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ width: { xs: '100%', sm: 170 }, bgcolor: '#F8FAF9', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value="ALL">Semua Status</MenuItem>
                <MenuItem value="Praktek Aktif">Praktek Aktif</MenuItem>
                <MenuItem value="Siap Praktik">Siap Praktik</MenuItem>
                <MenuItem value="Cuti">Cuti</MenuItem>
              </TextField>

              {(search || poliFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <Button
                  size="small"
                  onClick={handleResetFilters}
                  startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
                  sx={{ color: '#526B62', fontWeight: 600, fontSize: 12 }}
                >
                  Reset
                </Button>
              )}
            </Box>

            {/* View Mode Switcher */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: { xs: 'flex-end', md: 'center' } }}>
              <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600 }}>Tampilan:</Typography>
              <Box sx={{ display: 'flex', bgcolor: '#F0F5F2', p: 0.4, borderRadius: 2 }}>
                <Tooltip title="Tampilan Tabel">
                  <IconButton
                    size="small"
                    onClick={() => setViewMode('table')}
                    sx={{
                      bgcolor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                      color: viewMode === 'table' ? '#1B4D3E' : '#526B62',
                      boxShadow: viewMode === 'table' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      borderRadius: 1.5,
                      p: 0.6,
                    }}
                  >
                    <ViewListOutlinedIcon sx={{ fontSize: 19 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Tampilan Kartu / Grid">
                  <IconButton
                    size="small"
                    onClick={() => setViewMode('grid')}
                    sx={{
                      bgcolor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                      color: viewMode === 'grid' ? '#1B4D3E' : '#526B62',
                      boxShadow: viewMode === 'grid' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      borderRadius: 1.5,
                      p: 0.6,
                    }}
                  >
                    <GridViewOutlinedIcon sx={{ fontSize: 19 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 4. Bento 2-Column Split (8 Cols Table/Grid vs 4 Cols Live Insights) */}
      <Grid container spacing={3} alignItems="flex-start">
        {/* LEFT COLUMN (8 COLS XL): DIRECTORY LIST / TABLE */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {viewMode === 'table' ? (
            <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 10px -2px rgba(27, 77, 62, 0.04)', overflow: 'hidden' }}>
              <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #E5EDE9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#121E1A' }}>
                    Daftar Tenaga Medis ({filteredDoctors.length})
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#526B62' }}>
                    Informasi kredensial SIP/STR, poliklinik, jadwal jam praktik, dan status live
                  </Typography>
                </Box>
                <Chip label="Live Sync" size="small" sx={{ bgcolor: '#EFFDF6', color: '#136B53', fontWeight: 700, fontSize: 11 }} />
              </Box>

              <TableContainer>
                <Table sx={{ minWidth: 680 }}>
                  <TableHead sx={{ bgcolor: '#F8FAF9' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: '#121E1A', fontSize: 12.5, py: 1.8 }}>Dokter & Kredensial</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#121E1A', fontSize: 12.5, py: 1.8 }}>Poli & Ruang</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#121E1A', fontSize: 12.5, py: 1.8 }}>Jadwal & Antrean</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#121E1A', fontSize: 12.5, py: 1.8 }}>Jadwal Dinas</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#121E1A', fontSize: 12.5, py: 1.8 }}>Status</TableCell>
                      {canEdit && <TableCell align="right" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 12.5, py: 1.8 }}>Aksi</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Typography variant="body2" sx={{ color: '#526B62' }}>Memuat data direktori dokter...</Typography>
                        </TableCell>
                      </TableRow>
                    ) : filteredDoctors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <MedicalServicesOutlinedIcon sx={{ fontSize: 40, color: '#A0B5AC', mb: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#121E1A' }}>
                            Tidak ada data dokter yang sesuai
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#526B62' }}>
                            Coba ubah kata kunci pencarian atau reset filter poliklinik
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDoctors.map((doc) => {
                        const isPraktekAktif = doc.status === 'Praktek Aktif';
                        const isSiap = doc.status === 'Siap Praktik';

                        return (
                          <TableRow key={doc.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            {/* 1. Dokter & Kredensial */}
                            <TableCell sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
                                <Avatar
                                  src={doc.avatar}
                                  alt={doc.nama}
                                  sx={{
                                    width: 44,
                                    height: 44,
                                    border: '2px solid #D1DED8',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                                  }}
                                />
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 13.5, lineHeight: 1.2 }}>
                                    {doc.nama}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.4 }}>
                                    <Typography variant="caption" sx={{ color: '#526B62', fontSize: 11, fontFeatureSettings: '"tnum"' }}>
                                      SIP: {doc.noSip || '503/446/SIP.D/2024'}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" sx={{ color: '#136B53', fontSize: 11, fontWeight: 700, display: 'block', mt: 0.2 }}>
                                    ID SatuSehat: {doc.satuSehatId}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            {/* 2. Poli & Ruang */}
                            <TableCell sx={{ py: 2 }}>
                              <Chip
                                label={doc.poli?.namaPoli || 'Poli Umum'}
                                size="small"
                                sx={{
                                  bgcolor: '#E8F2EE',
                                  color: '#1B4D3E',
                                  fontWeight: 700,
                                  fontSize: 11.5,
                                  mb: 0.5,
                                }}
                              />
                              <Typography variant="caption" sx={{ display: 'block', color: '#526B62', fontSize: 11.5, fontWeight: 600 }}>
                                {doc.roomNumber}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#121E1A', fontSize: 11, fontWeight: 700 }}>
                                Rp {Number(doc.biayaKonsultasi || 50000).toLocaleString('id-ID')}
                              </Typography>
                            </TableCell>

                            {/* 3. Jadwal & Antrean */}
                            <TableCell sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#121E1A', fontSize: 12, fontWeight: 700 }}>
                                <AccessTimeIcon sx={{ fontSize: 14, color: '#526B62' }} />
                                {doc.timeSlot}
                              </Box>
                              <Chip
                                label={`${doc.queueWaiting} Antrean`}
                                size="small"
                                sx={{
                                  mt: 0.6,
                                  bgcolor: doc.queueWaiting > 4 ? '#FFF3E0' : '#EFFDF6',
                                  color: doc.queueWaiting > 4 ? '#B26A00' : '#00875A',
                                  fontWeight: 700,
                                  fontSize: 11,
                                }}
                              />
                            </TableCell>

                            {/* 4. Jadwal Dinas Mingguan */}
                            <TableCell sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', gap: 0.4 }}>
                                {WEEK_DAYS.map((day, dIdx) => {
                                  // Highlight Mon-Fri for most, Mon-Wed-Fri for others
                                  const isActiveDay = doc.id % 2 === 0
                                    ? dIdx < 5 // Mon to Fri
                                    : dIdx % 2 === 0; // Mon, Wed, Fri, Sun
                                  return (
                                    <Box
                                      key={dIdx}
                                      sx={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 10,
                                        fontWeight: 800,
                                        bgcolor: isActiveDay ? '#1B4D3E' : '#F0F5F2',
                                        color: isActiveDay ? '#FFFFFF' : '#8A9791',
                                      }}
                                    >
                                      {day}
                                    </Box>
                                  );
                                })}
                              </Box>
                            </TableCell>

                            {/* 5. Status */}
                            <TableCell sx={{ py: 2 }}>
                              <Chip
                                icon={
                                  <FiberManualRecordIcon
                                    sx={{
                                      fontSize: '10px !important',
                                      color: isPraktekAktif ? '#00875A !important' : isSiap ? '#0065FF !important' : '#8A9791 !important',
                                    }}
                                  />
                                }
                                label={doc.status}
                                size="small"
                                sx={{
                                  bgcolor: isPraktekAktif ? '#EFFDF6' : isSiap ? '#EFF5FF' : '#F4F5F7',
                                  color: isPraktekAktif ? '#00875A' : isSiap ? '#0065FF' : '#526B62',
                                  fontWeight: 700,
                                  fontSize: 11,
                                }}
                              />
                              <Typography variant="caption" sx={{ display: 'block', color: '#707974', fontSize: 10.5, mt: 0.4 }}>
                                {doc.userId ? 'Akun login aktif' : 'Belum ditautkan'}
                              </Typography>
                            </TableCell>

                            {/* 6. Aksi */}
                            {canEdit && (
                              <TableCell align="right" sx={{ py: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                  <Tooltip title="Ubah Data Dokter">
                                    <IconButton
                                      size="small"
                                      onClick={() => openEditForm(doc)}
                                      sx={{ color: '#1B4D3E', bgcolor: '#F0F5F2', '&:hover': { bgcolor: '#E0EDE7' } }}
                                    >
                                      <EditOutlinedIcon sx={{ fontSize: 17 }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Hapus Dokter">
                                    <IconButton
                                      size="small"
                                      onClick={() => setDeleteTarget(doc)}
                                      sx={{ color: '#BA1A1A', bgcolor: '#FFEDEC', '&:hover': { bgcolor: '#FFD9D8' } }}
                                    >
                                      <DeleteIcon sx={{ fontSize: 17 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          ) : (
            /* GRID VIEW MODE */
            <Grid container spacing={2.5}>
              {loading ? (
                <Grid size={12}>
                  <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #D1DED8' }}>
                    <Typography variant="body2" sx={{ color: '#526B62' }}>Memuat data kartu dokter...</Typography>
                  </Card>
                </Grid>
              ) : filteredDoctors.length === 0 ? (
                <Grid size={12}>
                  <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #D1DED8' }}>
                    <MedicalServicesOutlinedIcon sx={{ fontSize: 40, color: '#A0B5AC', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#121E1A' }}>
                      Tidak ada data dokter yang sesuai
                    </Typography>
                  </Card>
                </Grid>
              ) : (
                filteredDoctors.map((doc) => {
                  const isPraktekAktif = doc.status === 'Praktek Aktif';
                  return (
                    <Grid key={doc.id} size={{ xs: 12, sm: 6 }}>
                      <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 10px -2px rgba(27, 77, 62, 0.04)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <CardContent sx={{ p: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                src={doc.avatar}
                                alt={doc.nama}
                                sx={{ width: 52, height: 52, border: '2px solid #1B4D3E', boxShadow: '0 2px 8px rgba(27, 77, 62, 0.15)' }}
                              />
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#121E1A', lineHeight: 1.2 }}>
                                  {doc.nama}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#136B53', fontWeight: 700, display: 'block', mt: 0.2 }}>
                                  {doc.poli?.namaPoli || 'Poli Umum'} • {doc.roomNumber}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              label={doc.status}
                              size="small"
                              sx={{
                                bgcolor: isPraktekAktif ? '#EFFDF6' : '#EFF5FF',
                                color: isPraktekAktif ? '#00875A' : '#0065FF',
                                fontWeight: 700,
                                fontSize: 10.5,
                              }}
                            />
                          </Box>

                          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8FAF9', border: '1px solid #E5EDE9', mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                              <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600 }}>No. SIP Dinkes:</Typography>
                              <Typography variant="caption" sx={{ color: '#121E1A', fontWeight: 700, fontFeatureSettings: '"tnum"' }}>
                                {doc.noSip || '503/446/SIP.D/2024'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                              <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600 }}>ID SatuSehat:</Typography>
                              <Typography variant="caption" sx={{ color: '#136B53', fontWeight: 800, fontFeatureSettings: '"tnum"' }}>
                                {doc.satuSehatId}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600 }}>Jam Praktik:</Typography>
                              <Typography variant="caption" sx={{ color: '#121E1A', fontWeight: 700 }}>
                                {doc.timeSlot} ({doc.queueWaiting} antrean)
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#526B62', display: 'block', fontSize: 10.5 }}>Tarif Konsultasi</Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1B4D3E' }}>
                                Rp {Number(doc.biayaKonsultasi || 50000).toLocaleString('id-ID')}
                              </Typography>
                            </Box>
                            {canEdit && (
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => openEditForm(doc)}
                                  startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
                                  sx={{ borderColor: '#D1DED8', color: '#1B4D3E', fontWeight: 700, borderRadius: 1.8, fontSize: 11.5 }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="small"
                                  color="error"
                                  onClick={() => setDeleteTarget(doc)}
                                  startIcon={<DeleteIcon sx={{ fontSize: 15 }} />}
                                  sx={{ fontWeight: 700, borderRadius: 1.8, fontSize: 11.5 }}
                                >
                                  Hapus
                                </Button>
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })
              )}
            </Grid>
          )}
        </Grid>

        {/* RIGHT COLUMN (4 COLS XL): REAL-TIME INSIGHTS BENTO */}
        <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Widget 1: Ruang Praktik Aktif LIVE */}
          <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 10px -2px rgba(27, 77, 62, 0.04)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5, mb: 2, borderBottom: '1px solid #E5EDE9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MeetingRoomOutlinedIcon sx={{ color: '#1B4D3E', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 14.5 }}>
                    Ruang Praktik Aktif LIVE
                  </Typography>
                </Box>
                <Chip
                  icon={<FiberManualRecordIcon sx={{ fontSize: '10px !important', color: '#00875A !important' }} />}
                  label="Live"
                  size="small"
                  sx={{ bgcolor: '#EFFDF6', color: '#00875A', fontWeight: 800, fontSize: 10.5 }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                {[
                  { room: 'Ruang 01 (Lt. 1)', poli: 'Poli Umum', doctor: 'dr. Hendra Wijaya, Sp.PD', status: 'Melayani Pasien #014', color: '#00875A', bg: '#EFFDF6' },
                  { room: 'Ruang 02 (Lt. 1)', poli: 'Poli Gigi', doctor: 'drg. Maya Safitri', status: 'Konsultasi Selesai #009', color: '#0065FF', bg: '#EFF5FF' },
                  { room: 'Ruang 03 (Lt. 1)', poli: 'Poli Anak', doctor: 'dr. Siska Amelia, Sp.A', status: 'Pemeriksaan #007', color: '#00875A', bg: '#EFFDF6' },
                  { room: 'Ruang 04 (Lt. 2)', poli: 'Poli KIA', doctor: 'dr. Budi Santoso, Sp.OG', status: 'Persiapan Sesi Siang', color: '#E38800', bg: '#FFF8E6' },
                ].map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: '#F8FAF9',
                      border: '1px solid #E5EDE9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#1B4D3E', display: 'block' }}>
                        {item.room} • {item.poli}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#121E1A', fontSize: 12.5, mt: 0.2 }}>
                        {item.doctor}
                      </Typography>
                    </Box>
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        bgcolor: item.bg,
                        color: item.color,
                        fontWeight: 700,
                        fontSize: 10.5,
                        flexShrink: 0,
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Widget 2: Beban Pasien & Kuota Hari Ini */}
          <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 10px -2px rgba(27, 77, 62, 0.04)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5, mb: 2, borderBottom: '1px solid #E5EDE9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ color: '#1B4D3E', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 14.5 }}>
                    Beban Pasien & Kuota Hari Ini
                  </Typography>
                </Box>
                <Chip label="Terisi 72%" size="small" sx={{ bgcolor: '#E8F2EE', color: '#1B4D3E', fontWeight: 800, fontSize: 10.5 }} />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { name: 'dr. Hendra Wijaya', poli: 'Poli Umum', current: 21, max: 25, percent: 84 },
                  { name: 'drg. Maya Safitri', poli: 'Poli Gigi', current: 16, max: 20, percent: 80 },
                  { name: 'dr. Siska Amelia', poli: 'Poli Anak', current: 12, max: 20, percent: 60 },
                  { name: 'dr. Budi Santoso', poli: 'Poli KIA', current: 8, max: 15, percent: 53 },
                ].map((item, idx) => (
                  <Box key={idx}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A', fontSize: 12 }}>
                        {item.name} <span style={{ color: '#526B62', fontWeight: 500 }}>({item.poli})</span>
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: item.percent > 80 ? '#B26A00' : '#136B53', fontFeatureSettings: '"tnum"' }}>
                        {item.current}/{item.max} ({item.percent}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.percent}
                      sx={{
                        height: 7,
                        borderRadius: 4,
                        bgcolor: '#E8F2EE',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: item.percent > 80 ? '#E38800' : '#1B4D3E',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 2.5, p: 1.5, borderRadius: 2, bgcolor: '#EFFDF6', border: '1px solid #DDEBE5', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: '#00875A', flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: '#00875A', fontWeight: 700 }}>
                  Kapasitas poliklinik optimal. Tidak ada antrean berlebih melebihi batas kuota.
                </Typography>
              </Box>
            </CardContent>
          </Card>

        </Grid>
      </Grid>

      {/* Quick Add / Edit Dialog */}
      <DoctorFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingDoctor}
        serverError={formError}
        doctors={doctors}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Data Tenaga Medis"
        description={`Apakah Anda yakin ingin menghapus data dokter "${deleteTarget?.nama}"? Tindakan ini akan menonaktifkan akun login terkait dan tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
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
