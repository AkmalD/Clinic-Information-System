import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, IconButton, Pagination, InputAdornment, Chip, Snackbar, Alert,
  Grid, Card, CardContent, Avatar, MenuItem, Select, FormControl, Menu, Tooltip,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAuth } from '../../context/AuthContext';
import { getPatients, createPatient, updatePatient, deletePatient } from '../../api/patients.api';
import PatientFormDialog from './PatientFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';

function calculateAge(birthDateStr) {
  if (!birthDateStr) return '-';
  const birthDate = new Date(birthDateStr);
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

function getInitials(name) {
  if (!name) return 'PS';
  const clean = name.replace(/^(dr|drg|tn|ny|nona|an)\.?\s*/i, '').trim();
  const parts = clean.split(' ').filter(Boolean);
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export default function PatientsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canEdit = ['ADMIN', 'PETUGAS'].includes(user?.role);

  const [patients, setPatients] = useState([]);
  const [metrics, setMetrics] = useState({
    totalPasien: 0,
    bpjsCount: 0,
    umumCount: 0,
    asuransiCount: 0,
    hariIniCount: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(true);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formError, setFormError] = useState('');

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Row Action Menu State
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activePatient, setActivePatient] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchPatients = useCallback((page = 1, limit = pagination.limit) => {
    setLoading(true);
    getPatients({ page, limit, search, kategori, gender })
      .then((res) => {
        setPatients(res.data.patients || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
        if (res.data.metrics) {
          setMetrics(res.data.metrics);
        }
      })
      .catch((err) => {
        setSnackbar({ open: true, message: err?.message || 'Gagal mengambil data pasien', severity: 'error' });
      })
      .finally(() => setLoading(false));
  }, [search, kategori, gender, pagination.limit]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchPatients(1, pagination.limit), 350);
    return () => clearTimeout(timeout);
  }, [fetchPatients, pagination.limit]);

  const handleResetFilter = () => {
    setSearch('');
    setKategori('');
    setGender('');
  };

  const openAddForm = () => {
    navigate('/patients/new');
  };

  const openEditForm = (patient) => {
    setEditingPatient(patient);
    setFormError('');
    setFormOpen(true);
    setMenuAnchor(null);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, data);
        setSnackbar({ open: true, message: 'Data pasien berhasil diperbarui', severity: 'success' });
      } else {
        await createPatient(data);
        setSnackbar({ open: true, message: 'Pasien baru berhasil didaftarkan', severity: 'success' });
      }
      setFormOpen(false);
      fetchPatients(pagination.page, pagination.limit);
    } catch (err) {
      setFormError(err?.message || 'Gagal menyimpan data');
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deletePatient(deleteTarget.id);
      setSnackbar({ open: true, message: 'Data pasien berhasil dihapus', severity: 'success' });
      setDeleteTarget(null);
      fetchPatients(pagination.page, pagination.limit);
    } catch (err) {
      setSnackbar({ open: true, message: err?.message || 'Gagal menghapus data', severity: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Export data ke file CSV lokal
  const handleExportCSV = () => {
    if (patients.length === 0) {
      setSnackbar({ open: true, message: 'Tidak ada data untuk diekspor', severity: 'warning' });
      return;
    }

    const headers = ['No. RM', 'NIK', 'Nama Lengkap', 'Jenis Kelamin', 'Tanggal Lahir', 'No. Telepon', 'Alamat', 'Tgl Daftar'];
    const rows = patients.map((p) => [
      p.noRm,
      `'${p.nik}`,
      `"${p.nama.replace(/"/g, '""')}"`,
      p.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      p.tanggalLahir ? p.tanggalLahir.slice(0, 10) : '',
      `'${p.noTelp}`,
      `"${(p.alamat || '').replace(/"/g, '""')}"`,
      p.createdAt ? p.createdAt.slice(0, 10) : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_pasien_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({ open: true, message: 'Data pasien berhasil diekspor ke CSV', severity: 'success' });
  };

  const startPatientIdx = (pagination.page - 1) * pagination.limit + (patients.length > 0 ? 1 : 0);
  const endPatientIdx = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', pb: 4 }}>
      {/* 1. Page Header & Breadcrumbs */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 3.5, pt: 1 }}>
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
            <Typography variant="caption" sx={{ color: '#1B4D3E', fontWeight: 700 }}>Pasien</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#121E1A', letterSpacing: -0.5, fontSize: { xs: '1.6rem', md: '1.9rem' } }}>
            Data Pasien & Rekam Medis
          </Typography>
          <Typography variant="body2" sx={{ color: '#526B62', mt: 0.3, fontSize: 13.5 }}>
            Kelola database pasien terdaftar, riwayat kunjungan rekam medis, dan administrasi pendaftaran baru klinik.
          </Typography>
        </Box>

        {/* Quick Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={handleExportCSV}
            startIcon={<TableChartOutlinedIcon sx={{ fontSize: 19 }} />}
            sx={{
              bgcolor: '#E8F2EE',
              borderColor: '#D1DED8',
              color: '#1B4D3E',
              fontWeight: 700,
              fontSize: 13,
              borderRadius: 2,
              py: 0.9,
              px: 2,
              '&:hover': { bgcolor: '#D8E6DF', borderColor: '#1B4D3E' },
            }}
          >
            Export Data
          </Button>
          {canEdit && (
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
                py: 0.9,
                px: 2.2,
                boxShadow: '0 4px 14px rgba(27, 77, 62, 0.25)',
                '&:hover': { bgcolor: '#003629' },
              }}
            >
              Registrasi Pasien Baru
            </Button>
          )}
        </Box>
      </Box>

      {/* 2. Metric / Summary Cards Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Card 1: Total Pasien Terdaftar */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid rgba(27, 77, 62, 0.08)', borderRadius: 4, p: 1, bgcolor: '#FFFFFF' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#526B62', fontSize: 13 }}>
                  Total Pasien Terdaftar
                </Typography>
                <Box sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: '#E8F2EE', color: '#136B53', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#121E1A', letterSpacing: -0.5 }}>
                {Number(metrics.totalPasien || 0).toLocaleString('id-ID')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 1.5, bgcolor: '#F4F8F6', px: 1.5, py: 0.6, borderRadius: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 15, color: '#166534' }} />
                <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, fontSize: 11.5 }}>
                  +{metrics.hariIniCount || 0} pendaftaran hari ini
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2: Pasien BPJS Kesehatan */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid rgba(27, 77, 62, 0.08)', borderRadius: 4, p: 1, bgcolor: '#FFFFFF' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#526B62', fontSize: 13 }}>
                  Pasien BPJS Kesehatan
                </Typography>
                <Box sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: '#A0F0D1', color: '#003629', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HealthAndSafetyOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#121E1A', letterSpacing: -0.5 }}>
                  {metrics.bpjsCount || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: '#136B53', fontWeight: 700, fontSize: 13 }}>
                  {metrics.totalPasien ? Math.round((metrics.bpjsCount / metrics.totalPasien) * 100) : 0}%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, bgcolor: '#F4F8F6', px: 1.5, py: 0.6, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#166534' }} />
                  <Typography variant="caption" sx={{ color: '#121E1A', fontWeight: 600, fontSize: 11 }}>
                    Bridging PCare
                  </Typography>
                </Box>
                <Chip
                  label="Terverifikasi"
                  size="small"
                  sx={{ bgcolor: '#A0F0D1', color: '#003629', fontWeight: 800, fontSize: 10, height: 18 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 3: Pasien Umum & Mandiri */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid rgba(27, 77, 62, 0.08)', borderRadius: 4, p: 1, bgcolor: '#FFFFFF' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#526B62', fontSize: 13 }}>
                  Pasien Umum & Mandiri
                </Typography>
                <Box sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: '#E8F2EE', color: '#136B53', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PaymentsOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#121E1A', letterSpacing: -0.5 }}>
                  {metrics.umumCount || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 700, fontSize: 13 }}>
                  {metrics.totalPasien ? Math.round((metrics.umumCount / metrics.totalPasien) * 100) : 0}%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 1.5, bgcolor: '#F4F8F6', px: 1.5, py: 0.6, borderRadius: 2 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#136B53' }} />
                <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600, fontSize: 11 }}>
                  Termasuk {metrics.asuransiCount || 0} Asuransi Swasta
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 4: Pasien Baru Hari Ini */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid rgba(27, 77, 62, 0.08)', borderRadius: 4, p: 1, bgcolor: '#FFFFFF' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#526B62', fontSize: 13 }}>
                  Pasien Baru Hari Ini
                </Typography>
                <Box sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: '#E8F2EE', color: '#003629', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HowToRegOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1B4D3E', letterSpacing: -0.5 }}>
                {metrics.hariIniCount || 0}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, bgcolor: '#F4F8F6', px: 1.5, py: 0.6, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600, fontSize: 11 }}>
                  Proses Loket Pendaftaran
                </Typography>
                <Typography variant="caption" sx={{ color: '#136B53', fontWeight: 700, fontSize: 11 }}>
                  {patients.length} Aktif
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Main Patient Table Section */}
      <Card elevation={0} sx={{ border: '1px solid rgba(27, 77, 62, 0.08)', borderRadius: 4, bgcolor: '#FFFFFF', p: { xs: 2, sm: 3 } }}>
        {/* Filter & Action Toolbar */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', lg: 'center' }, gap: 2, mb: 3 }}>
          {/* Search Box */}
          <Box sx={{ flex: 1, maxWidth: { lg: 520 } }}>
            <TextField
              fullWidth
              placeholder="Cari No. RM, Nama Pasien, NIK, atau No. Telepon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#707974', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#F4F8F6',
                  borderRadius: 3,
                  py: 0.3,
                  fontSize: 13.5,
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: '#A0F0D1' },
                  '&.Mui-focused fieldset': { borderColor: '#1B4D3E', bgcolor: '#FFFFFF' },
                },
              }}
            />
          </Box>

          {/* Dropdown Filters */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {/* Kategori Filter */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                displayEmpty
                sx={{
                  bgcolor: '#F4F8F6',
                  borderRadius: 2,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#121E1A',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: '#D1DED8' },
                  '&.Mui-focused fieldset': { borderColor: '#1B4D3E' },
                }}
              >
                <MenuItem value="">Kategori: Semua</MenuItem>
                <MenuItem value="bpjs">BPJS Kesehatan</MenuItem>
                <MenuItem value="umum">Pasien Umum</MenuItem>
                <MenuItem value="asuransi">Asuransi Swasta</MenuItem>
              </Select>
            </FormControl>

            {/* Gender Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                displayEmpty
                sx={{
                  bgcolor: '#F4F8F6',
                  borderRadius: 2,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#121E1A',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: '#D1DED8' },
                  '&.Mui-focused fieldset': { borderColor: '#1B4D3E' },
                }}
              >
                <MenuItem value="">Gender: Semua</MenuItem>
                <MenuItem value="L">Laki-laki (L)</MenuItem>
                <MenuItem value="P">Perempuan (P)</MenuItem>
              </Select>
            </FormControl>

            {/* Reset Button */}
            {(search || kategori || gender) && (
              <Tooltip title="Reset Filter">
                <IconButton
                  size="small"
                  onClick={handleResetFilter}
                  sx={{
                    bgcolor: '#F4F8F6',
                    color: '#BA1A1A',
                    p: 1,
                    '&:hover': { bgcolor: '#FFDAD6' },
                  }}
                >
                  <FilterAltOffOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Data Table */}
        <TableContainer sx={{ overflowX: 'auto', borderRadius: 2 }}>
          <Table sx={{ minWidth: 850 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F4F8F6' }}>
                <TableCell sx={{ py: 1.8, px: 2, fontWeight: 700, fontSize: 11, color: '#526B62', textTransform: 'uppercase', letterSpacing: 0.5, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>
                  No. RM
                </TableCell>
                <TableCell sx={{ py: 1.8, px: 2, fontWeight: 700, fontSize: 11, color: '#526B62', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Nama Pasien & NIK
                </TableCell>
                <TableCell sx={{ py: 1.8, px: 2, fontWeight: 700, fontSize: 11, color: '#526B62', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Kategori
                </TableCell>
                <TableCell sx={{ py: 1.8, px: 2, fontWeight: 700, fontSize: 11, color: '#526B62', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Kontak & Domisili
                </TableCell>
                <TableCell sx={{ py: 1.8, px: 2, fontWeight: 700, fontSize: 11, color: '#526B62', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Kunjungan Terakhir
                </TableCell>
                <TableCell sx={{ py: 1.8, px: 2, fontWeight: 700, fontSize: 11, color: '#526B62', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Status
                </TableCell>
                <TableCell align="right" sx={{ py: 1.8, px: 2, fontWeight: 700, fontSize: 11, color: '#526B62', textTransform: 'uppercase', letterSpacing: 0.5, borderTopRightRadius: 8, borderBottomRightRadius: 8 }}>
                  Aksi
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#1B4D3E' }} />
                    <Typography variant="body2" sx={{ color: '#526B62', mt: 1 }}>Memuat data pasien...</Typography>
                  </TableCell>
                </TableRow>
              ) : patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#121E1A' }}>Belum ada data pasien</Typography>
                    <Typography variant="caption" sx={{ color: '#526B62' }}>Coba ubah kata kunci pencarian atau daftarkan pasien baru.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((p) => {
                  const lastReg = p.registrations?.[0];
                  const categoryName = lastReg?.jenisPembayaran || 'UMUM';
                  const isBpjs = categoryName === 'BPJS';
                  const isAsuransi = categoryName === 'ASURANSI';

                  return (
                    <TableRow
                      key={p.id}
                      hover
                      sx={{
                        '&:hover': { bgcolor: '#F4F8F6' },
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* No. RM */}
                      <TableCell sx={{ py: 2, px: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#1B4D3E', fontSize: 13.5 }}>
                          {p.noRm}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#707974', fontSize: 11 }}>
                          Daftar: {formatDateIndo(p.createdAt)}
                        </Typography>
                      </TableCell>

                      {/* Nama Pasien & NIK */}
                      <TableCell sx={{ py: 2, px: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: '#E8F2EE', color: '#1B4D3E', fontWeight: 800, fontSize: 12.5 }}>
                            {getInitials(p.nama)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#121E1A', fontSize: 13.5 }}>
                              {p.nama}{' '}
                              <Typography component="span" sx={{ color: '#526B62', fontWeight: 400, fontSize: 12 }}>
                                ({calculateAge(p.tanggalLahir)} th, {p.jenisKelamin})
                              </Typography>
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                              <BadgeOutlinedIcon sx={{ fontSize: 13, color: '#707974' }} />
                              <Typography variant="caption" sx={{ color: '#526B62', fontSize: 11 }}>
                                NIK: {p.nik}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Kategori */}
                      <TableCell sx={{ py: 2, px: 2 }}>
                        <Chip
                          icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isBpjs ? '#166534' : isAsuransi ? '#0284C7' : '#526B62', ml: '6px !important' }} />}
                          label={isBpjs ? 'BPJS Kesehatan' : isAsuransi ? 'Asuransi Swasta' : 'Pasien Umum'}
                          size="small"
                          sx={{
                            borderRadius: 50,
                            fontWeight: 700,
                            fontSize: 11,
                            bgcolor: isBpjs ? '#E8F7EE' : isAsuransi ? '#E0F2FE' : '#E8F2EE',
                            color: isBpjs ? '#166534' : isAsuransi ? '#075985' : '#121E1A',
                          }}
                        />
                      </TableCell>

                      {/* Kontak & Domisili */}
                      <TableCell sx={{ py: 2, px: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', fontSize: 12.5 }}>
                          {p.noTelp}
                        </Typography>
                        <Tooltip title={p.alamat || '-'}>
                          <Typography variant="caption" sx={{ color: '#526B62', fontSize: 11.5, display: 'block', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.alamat || '-'}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      {/* Kunjungan Terakhir */}
                      <TableCell sx={{ py: 2, px: 2 }}>
                        {lastReg ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', fontSize: 12.5 }}>
                              {formatDateIndo(lastReg.tanggalKunjungan)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#136B53', fontWeight: 600, fontSize: 11 }}>
                              {lastReg.poli?.namaPoli || 'Poli Umum'} • {lastReg.doctor?.nama || 'dr. Jaga'}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#707974', fontStyle: 'italic' }}>
                            Belum pernah kunjungan
                          </Typography>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell sx={{ py: 2, px: 2 }}>
                        <Chip
                          icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#166534', ml: '6px !important' }} />}
                          label="Aktif"
                          size="small"
                          sx={{
                            borderRadius: 50,
                            fontWeight: 800,
                            fontSize: 11,
                            bgcolor: '#E8F7EE',
                            color: '#166534',
                          }}
                        />
                      </TableCell>

                      {/* Aksi */}
                      <TableCell align="right" sx={{ py: 2, px: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.8 }}>
                          {/* Rekam Medis Pasien */}
                          <Tooltip title="Lihat Rekam Medis Pasien">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/medical-records?patientId=${p.id}`)}
                              sx={{
                                color: '#1B4D3E',
                                bgcolor: '#F4F8F6',
                                '&:hover': { bgcolor: '#E8F2EE' },
                              }}
                            >
                              <AssignmentOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>

                          {/* Antrean / Pendaftaran */}
                          <Button
                            size="small"
                            onClick={() => navigate(`/registrations?patientId=${p.id}`)}
                            startIcon={<HowToRegOutlinedIcon sx={{ fontSize: 15 }} />}
                            sx={{
                              bgcolor: '#E8F2EE',
                              color: '#1B4D3E',
                              fontWeight: 700,
                              fontSize: 11.5,
                              borderRadius: 1.8,
                              py: 0.4,
                              px: 1.2,
                              '&:hover': { bgcolor: '#D8E6DF' },
                            }}
                          >
                            Antrean
                          </Button>

                          {/* Opsi Pasien */}
                          {canEdit && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setMenuAnchor(e.currentTarget);
                                setActivePatient(p);
                              }}
                              sx={{ color: '#707974' }}
                            >
                              <MoreVertIcon sx={{ fontSize: 18 }} />
                            </IconButton>
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

        {/* Table Footer & Pagination Controls */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            pt: 2.5,
            mt: 2,
            borderTop: '1px solid rgba(27, 77, 62, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#526B62', fontSize: 13 }}>
              Menampilkan <strong>{startPatientIdx} - {endPatientIdx}</strong> dari <strong>{pagination.total}</strong> data pasien
            </Typography>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select
                value={pagination.limit}
                onChange={(e) => setPagination((prev) => ({ ...prev, limit: Number(e.target.value) }))}
                sx={{
                  bgcolor: '#F4F8F6',
                  borderRadius: 1.5,
                  fontSize: 12,
                  fontWeight: 600,
                  height: 32,
                  '& fieldset': { borderColor: 'transparent' },
                }}
              >
                <MenuItem value={10}>10 per halaman</MenuItem>
                <MenuItem value={25}>25 per halaman</MenuItem>
                <MenuItem value={50}>50 per halaman</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {pagination.totalPages > 1 && (
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={(_, page) => fetchPatients(page, pagination.limit)}
              color="primary"
              shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 1.5,
                  fontWeight: 600,
                  fontSize: 12.5,
                },
                '& .Mui-selected': {
                  bgcolor: '#1B4D3E !important',
                  color: '#FFFFFF',
                },
              }}
            />
          )}
        </Box>
      </Card>

      {/* Row Menu (Edit / Delete) */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setActivePatient(null);
        }}
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            boxShadow: '0 10px 30px -4px rgba(27, 77, 62, 0.12)',
            minWidth: 160,
            p: 0.5,
          },
        }}
      >
        <MenuItem onClick={() => openEditForm(activePatient)} sx={{ fontSize: 13, gap: 1, borderRadius: 1.5 }}>
          <EditOutlinedIcon fontSize="small" sx={{ color: '#1B4D3E' }} />
          Ubah Data Pasien
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteTarget(activePatient);
            setMenuAnchor(null);
          }}
          sx={{ fontSize: 13, gap: 1, borderRadius: 1.5, color: '#BA1A1A' }}
        >
          <DeleteOutlineOutlinedIcon fontSize="small" />
          Hapus Pasien
        </MenuItem>
      </Menu>

      {/* Patient Form Dialog */}
      <PatientFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingPatient}
        serverError={formError}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Data Pasien"
        description={`Apakah Anda yakin ingin menghapus data pasien "${deleteTarget?.nama}" (No. RM: ${deleteTarget?.noRm})? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      {/* Global Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ borderRadius: 2.5, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}