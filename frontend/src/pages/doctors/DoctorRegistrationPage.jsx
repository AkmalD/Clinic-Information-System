import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Grid, Card, CardContent,
  FormControl, Select, MenuItem, Chip, Alert, Snackbar, InputAdornment, Switch,
} from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import TimerOffOutlinedIcon from '@mui/icons-material/TimerOffOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';

import { getPoli } from '../../api/poli.api';
import { createDoctor } from '../../api/doctors.api';

const DEFAULT_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

const DAY_OPTIONS = [
  { id: 'Senin', short: 'Sen', time: '08:00-13:00' },
  { id: 'Selasa', short: 'Sel', time: '08:00-13:00' },
  { id: 'Rabu', short: 'Rab', time: '08:00-13:00' },
  { id: 'Kamis', short: 'Kam', time: '08:00-13:00' },
  { id: 'Jumat', short: 'Jum', time: '08:00-11:30' },
  { id: 'Sabtu', short: 'Sab', time: 'Libur' },
  { id: 'Minggu', short: 'Min', time: 'Libur' },
];

export default function DoctorRegistrationPage() {
  const navigate = useNavigate();

  // Master Data Poliklinik
  const [polis, setPolis] = useState([]);

  // Section 1: Informasi Personal & Kontak Medis
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&auto=format&fit=crop');
  const [gelarDepan, setGelarDepan] = useState('dr.');
  const [namaLengkap, setNamaLengkap] = useState('Hendra Wijaya');
  const [gelarBelakang, setGelarBelakang] = useState('Sp.PD, K-GEH');
  const [nik, setNik] = useState('3174051208850003');
  const [gender, setGender] = useState('Laki-laki');
  const [noHp, setNoHp] = useState('81298442011');
  const [email, setEmail] = useState('hendra.wijaya@pratamaclinic.id');

  // Section 3: Penempatan Poliklinik & Spesialisasi
  const [poliUtamaId, setPoliUtamaId] = useState('');
  const [poliSekunder, setPoliSekunder] = useState('');
  const [ruangPraktik, setRuangPraktik] = useState('Ruang 03 (Lantai 1)');
  const [tipePraktik, setTipePraktik] = useState('Full Time');

  // Section 4: Pengaturan Jadwal Praktik & Kuota
  const [selectedDays, setSelectedDays] = useState(DEFAULT_DAYS);
  const [shift, setShift] = useState('Pagi');
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('13:30');
  const [batasiKuota, setBatasiKuota] = useState(true);
  const [kuotaMaks, setKuotaMaks] = useState(25);
  const [durasiKonsul, setDurasiKonsul] = useState(15);

  // Status & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load Poli master
  useEffect(() => {
    getPoli().then((res) => {
      const list = res.data || [];
      setPolis(list);
      if (list.length > 0) {
        setPoliUtamaId(list[0].id);
      }
    });
  }, []);

  const toggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleReset = () => {
    setNamaLengkap('');
    setGelarBelakang('');
    setNik('');
    setNoHp('');
    setEmail('');
    setGender('Laki-laki');
    setGelarDepan('dr.');
    setPoliSekunder('');
    setSelectedDays(DEFAULT_DAYS);
    setShift('Pagi');
    setJamMulai('08:00');
    setJamSelesai('13:30');
    setBatasiKuota(true);
    setKuotaMaks(25);
    setDurasiKonsul(15);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!namaLengkap.trim()) {
      setSnackbar({ open: true, message: 'Nama dokter wajib diisi', severity: 'warning' });
      return;
    }
    if (!poliUtamaId) {
      setSnackbar({ open: true, message: 'Poliklinik utama wajib dipilih', severity: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      const fullName = `${gelarDepan} ${namaLengkap.trim()}${gelarBelakang ? ', ' + gelarBelakang.trim() : ''}`.trim();
      const cleanUsername = ('dr' + namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, '')).slice(0, 25) || `dr${Date.now().toString().slice(-4)}`;

      const payload = {
        nama: fullName,
        poliId: Number(poliUtamaId),
        noSip: '503/446/SIP.D-SP/DPMPTSP/2024',
        biayaKonsultasi: 65000,
        username: cleanUsername,
        password: 'Klinik123#',
      };

      await createDoctor(payload);
      setSnackbar({ open: true, message: `Dokter ${fullName} berhasil disimpan dan didaftarkan!`, severity: 'success' });
      setTimeout(() => navigate('/doctors'), 1200);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal menyimpan data dokter';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPoliObj = polis.find((p) => p.id === Number(poliUtamaId)) || polis[0];
  const fullDoctorDisplayName = `${gelarDepan} ${namaLengkap || 'Nama Dokter'}${gelarBelakang ? ', ' + gelarBelakang : ''}`;

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', pb: 6, pt: 1 }}>
      {/* 1. Header Section / Breadcrumb & Meta */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 3.5 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#526B62', fontSize: 13, mb: 0.8 }}>
            <Box
              component="span"
              onClick={() => navigate('/')}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', '&:hover': { color: '#003629' } }}
            >
              <HomeOutlinedIcon sx={{ fontSize: 16 }} />
              Beranda
            </Box>
            <ChevronRightIcon sx={{ fontSize: 14, color: '#707974' }} />
            <Typography variant="caption" sx={{ color: '#526B62', fontSize: 13 }}>Tenaga Medis</Typography>
            <ChevronRightIcon sx={{ fontSize: 14, color: '#707974' }} />
            <Box
              component="span"
              onClick={() => navigate('/doctors')}
              sx={{ cursor: 'pointer', '&:hover': { color: '#003629' } }}
            >
              Dokter & Spesialis
            </Box>
            <ChevronRightIcon sx={{ fontSize: 14, color: '#707974' }} />
            <Typography variant="caption" sx={{ color: '#003629', fontWeight: 700, fontSize: 13 }}>Tambah Dokter Baru</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#121E1A', letterSpacing: -0.5, fontSize: { xs: '1.6rem', md: '1.9rem' } }}>
            Tambah Data Dokter Baru
          </Typography>
          <Typography variant="body2" sx={{ color: '#526B62', mt: 0.4, fontSize: 13.5, maxWidth: 850 }}>
            Lengkapi identitas tenaga medis, spesialisasi, kredensial izin praktik (SIP/STR), integrasi ID SatuSehat Kemenkes, serta pengaturan jadwal operasional poliklinik PRATAMA.
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/doctors')}
            startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: '#E9F7F0',
              borderColor: '#E9F7F0',
              color: '#003629',
              fontWeight: 700,
              fontSize: 13,
              borderRadius: 2,
              px: 2,
              py: 0.8,
              '&:hover': { bgcolor: '#D8E6DF', borderColor: '#D8E6DF' },
            }}
          >
            Batal / Kembali
          </Button>
          <Button
            variant="contained"
            onClick={() => setSnackbar({ open: true, message: 'Draf formulir dokter berhasil disimpan', severity: 'info' })}
            startIcon={<DraftsOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: '#DDEBE5',
              color: '#121E1A',
              fontWeight: 700,
              fontSize: 13,
              borderRadius: 2,
              px: 2,
              py: 0.8,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#CFDDD7' },
            }}
          >
            Simpan Draf
          </Button>
        </Box>
      </Box>

      {/* 2. Main 2-Column Grid (8 Cols Form vs 4 Cols Sticky Summary Card) */}
      <Grid container spacing={3.5} alignItems="flex-start">
        {/* LEFT COLUMN: 8 COLS (FORM SECTIONS) */}
        <Grid size={{ xs: 12, lg: 8 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {/* SECTION 1: INFORMASI PERSONAL & KONTAK MEDIS */}
          <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 12px -2px rgba(27, 77, 62, 0.05)' }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2, mb: 2.5, borderBottom: '1px solid #F0F5F2' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#1B4D3E', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
                    01
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 16 }}>
                      Informasi Personal & Kontak Medis
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#526B62', fontSize: 12.5 }}>
                      Identitas dasar kependudukan dan sarana komunikasi dinas dokter
                    </Typography>
                  </Box>
                </Box>
                <Chip label="Wajib Diisi" size="small" sx={{ bgcolor: '#A0F0D1', color: '#136B53', fontWeight: 700, fontSize: 11 }} />
              </Box>

              {/* Avatar / Foto Profil Upload Area */}
              <Box sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#E9F7F0', border: '1px solid #D8E6DF', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2.5, mb: 3 }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '3px solid #003629',
                    boxShadow: '0 4px 12px rgba(27, 77, 62, 0.15)',
                  }}
                >
                  <Box
                    component="img"
                    src={avatarUrl}
                    alt="Foto Dokter"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(0, 54, 41, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      cursor: 'pointer',
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    <PhotoCameraOutlinedIcon sx={{ color: '#FFFFFF', fontSize: 24 }} />
                  </Box>
                </Box>
                <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#121E1A' }}>
                    Pasfoto Resmi Dokter / Tenaga Medis
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#526B62', display: 'block', mt: 0.3, mb: 1.5 }}>
                    Format JPG, JPEG, atau PNG. Latar belakang polos resmi (merah/putih), rasio 3:4, ukuran file maksimal 2.0 MB.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                    <Button
                      size="small"
                      variant="contained"
                      component="label"
                      startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 16 }} />}
                      sx={{ bgcolor: '#003629', color: '#FFFFFF', fontWeight: 700, fontSize: 12, borderRadius: 2, '&:hover': { bgcolor: '#1B4D3E' } }}
                    >
                      Unggah Foto Resmi
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setAvatarUrl(URL.createObjectURL(file));
                        }}
                      />
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setAvatarUrl('https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&auto=format&fit=crop')}
                      sx={{ color: '#526B62', bgcolor: '#DDEBE5', fontWeight: 600, fontSize: 12, borderRadius: 2, '&:hover': { bgcolor: '#CFDDD7' } }}
                    >
                      Hapus
                    </Button>
                  </Box>
                </Box>
              </Box>

              {/* Names & Titles */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A', display: 'block', mb: 0.6 }}>
                    Gelar Depan
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select value={gelarDepan} onChange={(e) => setGelarDepan(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#E9F7F0' }}>
                      <MenuItem value="dr.">dr.</MenuItem>
                      <MenuItem value="drg.">drg.</MenuItem>
                      <MenuItem value="Prof. dr.">Prof. dr.</MenuItem>
                      <MenuItem value="Dr. dr.">Dr. dr.</MenuItem>
                      <MenuItem value="Bdn.">Bdn. (Bidan)</MenuItem>
                      <MenuItem value="Ns.">Ns. (Ners)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A', display: 'block', mb: 0.6 }}>
                    Nama Lengkap Tenaga Medis <span style={{ color: '#BA1A1A' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    placeholder="Masukkan nama lengkap tanpa gelar..."
                    sx={{ bgcolor: '#E9F7F0', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A', display: 'block', mb: 0.6 }}>
                    Gelar Belakang
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={gelarBelakang}
                    onChange={(e) => setGelarBelakang(e.target.value)}
                    placeholder="e.g. Sp.A, Sp.PD"
                    sx={{ bgcolor: '#E9F7F0', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>

              {/* NIK & Gender */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A', display: 'block', mb: 0.6 }}>
                    Nomor Induk Kependudukan (NIK) <span style={{ color: '#BA1A1A' }}>*</span>
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={nik}
                      onChange={(e) => setNik(e.target.value)}
                      placeholder="16 digit nomor e-KTP..."
                      slotProps={{ htmlInput: { maxLength: 16 } }}
                      sx={{ bgcolor: '#E9F7F0', '& .MuiOutlinedInput-root': { borderRadius: 2 }, fontFeatureSettings: '"tnum"' }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<ManageSearchIcon sx={{ fontSize: 18 }} />}
                      sx={{ bgcolor: '#A0F0D1', color: '#136B53', fontWeight: 700, flexShrink: 0, px: 2, borderRadius: 2, '&:hover': { bgcolor: '#87D6B8' } }}
                    >
                      Cek Dukcapil
                    </Button>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#136B53', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, fontWeight: 600 }}>
                    <CheckCircleIcon sx={{ fontSize: 14 }} /> Terverifikasi dengan Disdukcapil RI
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A', display: 'block', mb: 0.6 }}>
                    Jenis Kelamin <span style={{ color: '#BA1A1A' }}>*</span>
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, height: 40 }}>
                    {['Laki-laki', 'Perempuan'].map((g) => {
                      const isSelected = gender === g;
                      return (
                        <Box
                          key={g}
                          onClick={() => setGender(g)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.8,
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: isSelected ? '#1B4D3E' : '#E9F7F0',
                            color: isSelected ? '#FFFFFF' : '#121E1A',
                            border: '1px solid',
                            borderColor: isSelected ? '#1B4D3E' : '#D1DED8',
                            transition: 'all 0.15s',
                          }}
                        >
                          {g === 'Laki-laki' ? <MaleIcon sx={{ fontSize: 18 }} /> : <FemaleIcon sx={{ fontSize: 18 }} />}
                          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 12 }}>{g}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Grid>
              </Grid>

              {/* Contact (WhatsApp & Email) */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A', display: 'block', mb: 0.6 }}>
                    Nomor WhatsApp / Kontak Seluler Aktif <span style={{ color: '#BA1A1A' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="812 xxxx xxxx"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700, fontSize: 12.5, color: '#121E1A' }}>
                              <span>🇮🇩</span>
                              <span>+62</span>
                              <span style={{ color: '#C0C9C3' }}>|</span>
                            </Box>
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ bgcolor: '#E9F7F0', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Typography variant="caption" sx={{ color: '#526B62', display: 'block', mt: 0.4 }}>
                    Digunakan untuk notifikasi jadwal antrean & darurat klinik.
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A', display: 'block', mb: 0.6 }}>
                    Email Resmi Pratama Clinic / Pribadi <span style={{ color: '#BA1A1A' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dr.nama@pratamaclinic.id"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon sx={{ fontSize: 18, color: '#707974' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ bgcolor: '#E9F7F0', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Typography variant="caption" sx={{ color: '#526B62', display: 'block', mt: 0.4 }}>
                    Digunakan untuk akses akun EMR & reset kata sandi.
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* SECTION 3: PENEMPATAN POLIKLINIK & SPESIALISASI */}
          <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 12px -2px rgba(27, 77, 62, 0.05)' }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2, mb: 2.5, borderBottom: '1px solid #F0F5F2' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#1B4D3E', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
                    03
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 16 }}>
                      Penempatan Poliklinik & Spesialisasi
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#526B62', fontSize: 12.5 }}>
                      Tentukan unit layanan, poliklinik tugas, dan ruang praktik
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                {/* Poli Utama */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A', display: 'block', mb: 0.6 }}>
                    Poliklinik Utama (Home Base) <span style={{ color: '#BA1A1A' }}>*</span>
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={poliUtamaId}
                      onChange={(e) => setPoliUtamaId(e.target.value)}
                      sx={{ borderRadius: 2, bgcolor: '#E9F7F0' }}
                    >
                      {polis.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.namaPoli} {p.kodePoli ? `(${p.kodePoli})` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Poli Sekunder */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A', display: 'block', mb: 0.6 }}>
                    Poliklinik Tambahan (Opsional)
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={poliSekunder}
                      onChange={(e) => setPoliSekunder(e.target.value)}
                      sx={{ borderRadius: 2, bgcolor: '#E9F7F0' }}
                    >
                      <MenuItem value="">-- Tidak ada poliklinik sekunder --</MenuItem>
                      <MenuItem value="Poli MCU & Skrining Kesehatan">Poli MCU & Skrining Kesehatan</MenuItem>
                      <MenuItem value="Poli Geriatri Terpadu">Poli Geriatri Terpadu</MenuItem>
                      <MenuItem value="Konsultan IGD Siaga">Konsultan IGD Siaga</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                {/* Ruangan Praktik Default */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A', display: 'block', mb: 0.6 }}>
                    Ruangan Praktik Default <span style={{ color: '#BA1A1A' }}>*</span>
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={ruangPraktik}
                      onChange={(e) => setRuangPraktik(e.target.value)}
                      sx={{ borderRadius: 2, bgcolor: '#E9F7F0' }}
                    >
                      <MenuItem value="Ruang 03 (Lantai 1)">Ruang 03 (Lantai 1 - Sayap Barat)</MenuItem>
                      <MenuItem value="Ruang 01 (Lantai 1)">Ruang 01 (Lantai 1 - Sayap Timur)</MenuItem>
                      <MenuItem value="Ruang 02 (Lantai 1)">Ruang 02 (Lantai 1 - Sayap Timur)</MenuItem>
                      <MenuItem value="Ruang 05 (Lantai 2)">Ruang 05 (Lantai 2 - VIP/Spesialis)</MenuItem>
                      <MenuItem value="Ruang Tindakan Medis">Ruang Tindakan Medis Khusus</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Status Ikatan Praktik */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A', display: 'block', mb: 0.6 }}>
                    Status Ikatan Praktik <span style={{ color: '#BA1A1A' }}>*</span>
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, height: 40 }}>
                    {['Full Time', 'Part Time', 'Tamu / On-Call'].map((t) => {
                      const isSelected = tipePraktik === t;
                      return (
                        <Box
                          key={t}
                          onClick={() => setTipePraktik(t)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: isSelected ? '#1B4D3E' : '#E9F7F0',
                            color: isSelected ? '#FFFFFF' : '#121E1A',
                            border: '1px solid',
                            borderColor: isSelected ? '#1B4D3E' : '#D1DED8',
                            fontSize: 12,
                            fontWeight: 700,
                            textAlign: 'center',
                            px: 0.5,
                            transition: 'all 0.15s',
                          }}
                        >
                          {t}
                        </Box>
                      );
                    })}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* SECTION 4: JADWAL PRAKTIK & KUOTA PASIEN */}
          <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 12px -2px rgba(27, 77, 62, 0.05)' }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2, mb: 2.5, borderBottom: '1px solid #F0F5F2' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#1B4D3E', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
                    04
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 16 }}>
                      Pengaturan Jadwal Praktik & Kuota Pasien
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#526B62', fontSize: 12.5 }}>
                      Konfigurasi hari aktif, jam kerja poliklinik, dan pembatasan kapasitas antrean
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Day Selector (7 Cards) */}
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A', display: 'block', mb: 1 }}>
                Hari Praktik Aktif Mingguan <span style={{ color: '#BA1A1A' }}>*</span>
              </Typography>
              <Grid container spacing={1} sx={{ mb: 2.5 }}>
                {DAY_OPTIONS.map((d) => {
                  const isActive = selectedDays.includes(d.id);
                  return (
                    <Grid key={d.id} size={{ xs: 6, sm: 3, md: 1.71 }}>
                      <Box
                        onClick={() => toggleDay(d.id)}
                        sx={{
                          p: 1.2,
                          borderRadius: 2,
                          textAlign: 'center',
                          cursor: 'pointer',
                          bgcolor: isActive ? '#A0F0D1' : '#E9F7F0',
                          color: isActive ? '#1A6F57' : '#121E1A',
                          border: '1.5px solid',
                          borderColor: isActive ? '#136B53' : '#D1DED8',
                          transition: 'all 0.15s',
                        }}
                      >
                        <Typography variant="caption" sx={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#707974' }}>
                          {d.short.toUpperCase()}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: 13 }}>
                          {d.id}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', fontSize: 10, fontWeight: 600, color: isActive ? '#136B53' : '#707974', mt: 0.3 }}>
                          {d.time}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Shift & Hours */}
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A', display: 'block', mb: 0.6 }}>
                    Shift Pelayanan
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select value={shift} onChange={(e) => setShift(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#E9F7F0' }}>
                      <MenuItem value="Pagi">Shift Pagi (Reguler)</MenuItem>
                      <MenuItem value="Sore">Shift Sore / Malam</MenuItem>
                      <MenuItem value="Penuh">Shift Ganda (Pagi & Sore)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A', display: 'block', mb: 0.6 }}>
                    Jam Mulai Layanan
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="time"
                    value={jamMulai}
                    onChange={(e) => setJamMulai(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><ScheduleOutlinedIcon sx={{ fontSize: 18, color: '#707974' }} /></InputAdornment>,
                      },
                    }}
                    sx={{ bgcolor: '#E9F7F0', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A', display: 'block', mb: 0.6 }}>
                    Jam Selesai Layanan
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="time"
                    value={jamSelesai}
                    onChange={(e) => setJamSelesai(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><TimerOffOutlinedIcon sx={{ fontSize: 18, color: '#707974' }} /></InputAdornment>,
                      },
                    }}
                    sx={{ bgcolor: '#E9F7F0', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>

              {/* Quota & Timing */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ p: 1.8, borderRadius: 2, bgcolor: '#E9F7F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#121E1A', fontSize: 13 }}>
                        Batasi Kuota Antrean Otomatis
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#526B62', display: 'block' }}>
                        Kunci pendaftaran saat kuota shift terpenuhi
                      </Typography>
                    </Box>
                    <Switch
                      checked={batasiKuota}
                      onChange={(e) => setBatasiKuota(e.target.checked)}
                      sx={{ '& .Mui-checked': { color: '#136B53' }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: '#136B53' } }}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A', display: 'block', mb: 0.6 }}>
                    Kuota Maks. Pasien
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={kuotaMaks}
                    onChange={(e) => setKuotaMaks(Number(e.target.value))}
                    slotProps={{
                      htmlInput: { min: 1, max: 100 },
                      input: {
                        endAdornment: <InputAdornment position="end"><Typography variant="caption" sx={{ color: '#707974' }}>Pasien</Typography></InputAdornment>,
                      },
                    }}
                    sx={{ bgcolor: '#E9F7F0', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A', display: 'block', mb: 0.6 }}>
                    Estimasi Konsultasi
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={durasiKonsul}
                    onChange={(e) => setDurasiKonsul(Number(e.target.value))}
                    slotProps={{
                      htmlInput: { min: 5, max: 60, step: 5 },
                      input: {
                        endAdornment: <InputAdornment position="end"><Typography variant="caption" sx={{ color: '#707974' }}>Menit</Typography></InputAdornment>,
                      },
                    }}
                    sx={{ bgcolor: '#E9F7F0', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT COLUMN: 4 COLS (STICKY PREVIEW & VERIFICATION SUMMARY CARD) */}
        <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: { lg: 'sticky' }, top: { lg: 80 } }}>
          {/* Live Preview Card */}
          <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 12px -2px rgba(27, 77, 62, 0.05)' }}>
            <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BadgeOutlinedIcon sx={{ color: '#136B53', fontSize: 20 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#707974', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  Pratinjau Kartu Dokter
                </Typography>
              </Box>

              {/* Doctor ID Badge Design with Watermark Pattern */}
              <Box
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 3,
                  p: 3,
                  background: 'linear-gradient(180deg, #E3F1EA 0%, #E9F7F0 100%)',
                  border: '1px solid #D8E6DF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                {/* Decorative Clinic Watermark Pattern */}
                <Box
                  sx={{
                    position: 'absolute',
                    right: -24,
                    bottom: -24,
                    color: 'rgba(27, 77, 62, 0.06)',
                    pointerEvents: 'none',
                  }}
                >
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 10.5h-4.5V6a1.5 1.5 0 0 0-3 0v4.5H7a1.5 1.5 0 0 0 0 3h4.5V18a1.5 1.5 0 0 0 3 0v-4.5H19a1.5 1.5 0 0 0 0-3z" />
                  </svg>
                </Box>

                {/* Avatar with Ring */}
                <Box
                  sx={{
                    position: 'relative',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    mb: 1.5,
                    border: '4px solid #A0F0D1',
                  }}
                >
                  <Box
                    component="img"
                    src={avatarUrl}
                    alt="Pratinjau Foto"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>

                {/* Doctor Name */}
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#121E1A', letterSpacing: -0.3, lineHeight: 1.2 }}>
                  {fullDoctorDisplayName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#136B53', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, mt: 0.5 }}>
                  {selectedPoliObj?.namaPoli || 'Spesialis Penyakit Dalam'}
                </Typography>

                {/* Room & Schedule Badges */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
                  <Chip
                    icon={<MeetingRoomOutlinedIcon sx={{ fontSize: '14px !important', color: '#136B53 !important' }} />}
                    label={ruangPraktik.includes('Ruang 03') ? 'R-03 Lt. 1' : ruangPraktik.includes('Ruang 01') ? 'R-01 Lt. 1' : ruangPraktik.includes('Ruang 02') ? 'R-02 Lt. 1' : 'R-05 Lt. 2'}
                    size="small"
                    sx={{ bgcolor: '#FFFFFF', color: '#121E1A', fontWeight: 600, fontSize: 11, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                  />
                  <Chip
                    icon={<ScheduleOutlinedIcon sx={{ fontSize: '14px !important', color: '#136B53 !important' }} />}
                    label={`${jamMulai} - ${jamSelesai}`}
                    size="small"
                    sx={{ bgcolor: '#FFFFFF', color: '#121E1A', fontWeight: 600, fontSize: 11, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                  />
                  <Chip
                    icon={<GroupsOutlinedIcon sx={{ fontSize: '14px !important', color: '#136B53 !important' }} />}
                    label={`Maks. ${kuotaMaks} Pasien`}
                    size="small"
                    sx={{ bgcolor: '#A0F0D1', color: '#1A6F57', fontWeight: 700, fontSize: 11 }}
                  />
                </Box>

                {/* SatuSehat Badge */}
                <Box sx={{ mt: 2, width: '100%', pt: 1.5, borderTop: '1px solid rgba(216, 230, 223, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#707974', textTransform: 'uppercase', fontSize: 10, display: 'block' }}>
                      ID SatuSehat
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#003629', fontWeight: 800, fontFamily: 'monospace', fontSize: 12 }}>
                      10002938472
                    </Typography>
                  </Box>
                  <Chip label="Tervalidasi" size="small" sx={{ bgcolor: '#136B53', color: '#FFFFFF', fontWeight: 700, fontSize: 10.5 }} />
                </Box>
              </Box>

              {/* Quick Notice Card */}
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#E3F1EA', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <InfoOutlinedIcon sx={{ fontSize: 18, color: '#003629', mt: 0.2, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: '#404945', lineHeight: 1.4 }}>
                  Dokter yang didaftarkan akan langsung terdaftar di antrean pendaftaran pasien, modul poli, serta modul resep digital PRATAMA Clinic.
                </Typography>
              </Box>

              {/* Submit & Reset Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 0.5 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting}
                  startIcon={<HowToRegIcon sx={{ fontSize: 20 }} />}
                  sx={{
                    height: 48,
                    borderRadius: 2,
                    bgcolor: '#003629',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 14,
                    boxShadow: '0 3px 10px rgba(0, 54, 41, 0.2)',
                    '&:hover': { bgcolor: '#1B4D3E' },
                  }}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan & Daftarkan Dokter'}
                </Button>
                <Button
                  fullWidth
                  onClick={handleReset}
                  sx={{
                    height: 40,
                    color: '#707974',
                    fontWeight: 600,
                    fontSize: 13,
                    borderRadius: 2,
                    '&:hover': { color: '#BA1A1A', bgcolor: '#FFDAD6' },
                  }}
                >
                  Reset Formulir Pendaftaran
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Helpdesk Support Snippet */}
          <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 10px -2px rgba(27, 77, 62, 0.04)' }}>
            <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ContactSupportOutlinedIcon sx={{ color: '#136B53', fontSize: 24 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#121E1A', fontSize: 13 }}>
                    Butuh Bantuan Integrasi?
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#526B62', display: 'block' }}>
                    Hubungi Tim SIM-RS / IT Pratama
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#136B53', fontSize: 12 }}>
                Ext: 108
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
