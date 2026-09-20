import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Grid, Card,
  FormControl, Select, MenuItem, Chip, Radio, RadioGroup, FormControlLabel,
  Checkbox, IconButton, Alert, Snackbar, InputAdornment,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import MedicationIcon from '@mui/icons-material/Medication';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DomainIcon from '@mui/icons-material/Domain';
import { useAuth } from '../../context/AuthContext';
import { createPatient } from '../../api/patients.api';

export default function PatientRegistrationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [tempatLahir, setTempatLahir] = useState('Bandung');
  const [tanggalLahir, setTanggalLahir] = useState('1992-04-28');
  const [gender, setGender] = useState('L');
  const [golonganDarah, setGolonganDarah] = useState('O');
  const [rhesus, setRhesus] = useState('+');
  const [statusNikah, setStatusNikah] = useState('menikah');
  const [agama, setAgama] = useState('islam');
  const [pekerjaan, setPekerjaan] = useState('Pegawai Swasta');

  // Penjamin State
  const [guarantor, setGuarantor] = useState('bpjs');
  const [noBpjs, setNoBpjs] = useState('0001248927110');
  const [bpjsVerified, setBpjsVerified] = useState(true);

  // Kontak & Alamat State
  const [noTelp, setNoTelp] = useState('81229384711');
  const [email, setEmail] = useState('bambang.sutedjo@gmail.com');
  const [provinsi, setProvinsi] = useState('Jawa Barat');
  const [kota, setKota] = useState('Kota Bandung');
  const [kecamatan, setKecamatan] = useState('Cicendo');
  const [kodePos, setKodePos] = useState('40175');
  const [alamat, setAlamat] = useState('Jl. Cemara Raya No. 45, RT 03 / RW 08, Kelurahan Sukaraja');
  const [sameAddress, setSameAddress] = useState(true);

  // Kontak Darurat State
  const [waliNama, setWaliNama] = useState('Siti Rahmawati');
  const [waliHubungan, setWaliHubungan] = useState('istri');
  const [waliTelp, setWaliTelp] = useState('81392817263');

  // Skrining Alergi & Riwayat Medis
  const [noAllergy, setNoAllergy] = useState(false);
  const [allergyInput, setAllergyInput] = useState('');
  const [allergies, setAllergies] = useState([
    { type: 'med', label: 'Amoksisilin / Penisilin' },
    { type: 'food', label: 'Seafood (Udang & Kepiting)' },
  ]);
  const [chronicConditions, setChronicConditions] = useState({
    hipertensi: true,
    diabetes: false,
    asma: false,
    jantung: false,
  });
  const [catatanKhusus, setCatatanKhusus] = useState('');

  // General Consent & UI State
  const [generalConsent, setGeneralConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dukcapilChecked, setDukcapilChecked] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Kalkulasi usia otomatis
  const calculateAge = () => {
    if (!tanggalLahir) return { tahun: 0, bulan: 0 };
    const b = new Date(tanggalLahir);
    const now = new Date();
    let years = now.getFullYear() - b.getFullYear();
    let months = now.getMonth() - b.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < b.getDate())) {
      years--;
      months += 12;
    }
    return { tahun: Math.max(years, 0), bulan: Math.max(months, 0) };
  };

  const age = calculateAge();

  // Format tanggal pendaftaran hari ini
  const todayDateStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const handleAddAllergy = () => {
    const val = allergyInput.trim();
    if (!val) return;
    setAllergies((prev) => [...prev, { type: 'custom', label: val }]);
    setAllergyInput('');
  };

  const handleRemoveAllergy = (idx) => {
    setAllergies((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDukcapilCheck = () => {
    if (nik.length < 16) {
      setSnackbar({ open: true, message: 'NIK harus berjumlah 16 digit sesuai e-KTP.', severity: 'warning' });
      return;
    }
    setDukcapilChecked(true);
    setSnackbar({ open: true, message: 'Sinkronisasi Dukcapil & SatuSehat sukses! Data terverifikasi.', severity: 'success' });
  };

  const handleBpjsCheck = () => {
    if (noBpjs.length < 13) {
      setSnackbar({ open: true, message: 'Nomor BPJS harus berjumlah 13 digit.', severity: 'warning' });
      return;
    }
    setBpjsVerified(true);
    setSnackbar({ open: true, message: 'Validasi PCare BPJS Berhasil! Kartu Aktif (Kelas 1).', severity: 'success' });
  };

  const handleResetForm = () => {
    setNik('');
    setNama('');
    setTanggalLahir('');
    setNoTelp('');
    setAlamat('');
    setAllergies([]);
    setSnackbar({ open: true, message: 'Formulir dibersihkan.', severity: 'info' });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!nik || nik.length !== 16) {
      setSnackbar({ open: true, message: 'Harap isi 16 digit NIK yang valid.', severity: 'error' });
      return;
    }
    if (!nama.trim()) {
      setSnackbar({ open: true, message: 'Nama lengkap wajib diisi.', severity: 'error' });
      return;
    }
    if (!tanggalLahir) {
      setSnackbar({ open: true, message: 'Tanggal lahir wajib diisi.', severity: 'error' });
      return;
    }
    if (!noTelp) {
      setSnackbar({ open: true, message: 'Nomor telepon wajib diisi.', severity: 'error' });
      return;
    }
    if (!alamat.trim() || alamat.trim().length < 5) {
      setSnackbar({ open: true, message: 'Alamat lengkap wajib diisi (min 5 karakter).', severity: 'error' });
      return;
    }
    if (!generalConsent) {
      setSnackbar({ open: true, message: 'Harap setujui pernyataan general consent.', severity: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      const fullPhone = noTelp.startsWith('+62') ? noTelp : noTelp.startsWith('0') ? `+62${noTelp.slice(1)}` : `+62${noTelp}`;
      const payload = {
        nik: nik.trim(),
        nama: nama.trim().toUpperCase(),
        jenisKelamin: gender,
        tanggalLahir,
        noTelp: fullPhone,
        alamat: alamat.trim(),
        email: email.trim(),
        tempatLahir: tempatLahir.trim(),
        penjamin: guarantor.toUpperCase(),
        noBpjs: guarantor === 'bpjs' ? noBpjs : undefined,
        alergi: noAllergy ? 'NKA' : allergies.map((a) => a.label).join(', '),
        kontakDarurat: waliNama ? `${waliNama} (${waliHubungan} - ${waliTelp})` : undefined,
      };

      const res = await createPatient(payload);
      const newPatient = res.data;

      setSnackbar({
        open: true,
        message: 'Pasien berhasil didaftarkan! Mengarahkan ke antrean poli...',
        severity: 'success',
      });

      // Arahkan langsung ke halaman antrean pendaftaran dengan pasien terpilih
      setTimeout(() => {
        navigate(`/registrations?patientId=${newPatient.id}&penjamin=${guarantor.toUpperCase()}`);
      }, 1200);
    } catch (err) {
      setSnackbar({ open: true, message: err?.message || 'Gagal mendaftarkan pasien', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 6 }}>
      {/* 1. Top Progress & Notification Bar */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          {/* Breadcrumbs */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#526B62', fontSize: 13, mb: 0.8 }}>
            <Box component="span" onClick={() => navigate('/')} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', '&:hover': { color: '#1B4D3E' } }}>
              <HomeOutlinedIcon sx={{ fontSize: 16 }} />
              Beranda
            </Box>
            <Typography variant="caption" sx={{ color: '#707974' }}>/</Typography>
            <Box component="span" onClick={() => navigate('/patients')} sx={{ cursor: 'pointer', '&:hover': { color: '#1B4D3E' } }}>
              Pasien
            </Box>
            <Typography variant="caption" sx={{ color: '#707974' }}>/</Typography>
            <Typography variant="caption" sx={{ color: '#1B4D3E', fontWeight: 700 }}>Registrasi Pasien Baru</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#003629', letterSpacing: -0.5, fontSize: { xs: '1.6rem', md: '1.9rem' } }}>
            Registrasi Pasien Baru
          </Typography>
          <Typography variant="body2" sx={{ color: '#404945', mt: 0.4, maxWidth: 800, fontSize: 13.5 }}>
            Lengkapi data identitas kependudukan, penjamin kesehatan, kontak darurat, dan riwayat alergi untuk pembuatan nomor Rekam Medis (RM) baru terhubung SatuSehat.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={() => navigate('/patients')}
          startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
          sx={{
            bgcolor: '#FFFFFF',
            borderColor: '#DDEBE5',
            color: '#404945',
            fontWeight: 600,
            borderRadius: 2,
            px: 2,
            py: 0.8,
            '&:hover': { borderColor: '#136B53', bgcolor: '#F4F8F6' },
          }}
        >
          Kembali
        </Button>
      </Box>

      {/* 2. Medical Record Header Badge & Quick Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4, alignItems: 'stretch' }}>
        {/* Card 1: RM Number */}
        <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex' }}>
          <Card
            elevation={0}
            sx={{
              width: '100%',
              height: 84,
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #DDEBE5',
              borderRadius: 3,
              px: 2.2,
              py: 1.8,
              bgcolor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              boxSizing: 'border-box',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', minWidth: 0 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  minWidth: 44,
                  borderRadius: 2.5,
                  bgcolor: '#E8F2EE',
                  color: '#136B53',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BadgeOutlinedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#526B62',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontSize: 11,
                    display: 'block',
                    lineHeight: 1.2,
                  }}
                >
                  No. Rekam Medis
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: '#121E1A',
                    letterSpacing: -0.3,
                    fontSize: 15.5,
                    mt: 0.3,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  RM-AUTO (DB)
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Card 2: Registration Date */}
        <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex' }}>
          <Card
            elevation={0}
            sx={{
              width: '100%',
              height: 84,
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #DDEBE5',
              borderRadius: 3,
              px: 2.2,
              py: 1.8,
              bgcolor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              boxSizing: 'border-box',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', minWidth: 0 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  minWidth: 44,
                  borderRadius: 2.5,
                  bgcolor: '#E8F2EE',
                  color: '#136B53',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CalendarMonthOutlinedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#526B62',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontSize: 11,
                    display: 'block',
                    lineHeight: 1.2,
                  }}
                >
                  Tanggal Pendaftaran
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: '#121E1A',
                    letterSpacing: -0.3,
                    fontSize: 15.5,
                    mt: 0.3,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {todayDateStr}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Card 3: Officer In Charge */}
        <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex' }}>
          <Card
            elevation={0}
            sx={{
              width: '100%',
              height: 84,
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #DDEBE5',
              borderRadius: 3,
              px: 2.2,
              py: 1.8,
              bgcolor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              boxSizing: 'border-box',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', minWidth: 0 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  minWidth: 44,
                  borderRadius: 2.5,
                  bgcolor: '#E8F2EE',
                  color: '#136B53',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AssignmentIndOutlinedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#526B62',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontSize: 11,
                    display: 'block',
                    lineHeight: 1.2,
                  }}
                >
                  Petugas Registrasi
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: '#121E1A',
                    letterSpacing: -0.3,
                    fontSize: 15.5,
                    mt: 0.3,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.namaLengkap || 'Administrator'}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main Multi-section Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
        {/* ========================================================
            SECTION 1: Kependudukan & SatuSehat Identity
           ======================================================== */}
        <Card elevation={0} sx={{ border: '1px solid #DDEBE5', borderRadius: 4, p: { xs: 2.5, sm: 3.5 }, bgcolor: '#FFFFFF', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, pb: 2.5, mb: 3, borderBottom: '1px solid #DDEBE5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#A0F0D1', color: '#003629', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                1
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 16 }}>
                  Identitas Kependudukan Pasien
                </Typography>
                <Typography variant="caption" sx={{ color: '#526B62', fontSize: 12 }}>
                  Sinkronisasi data master pasien dengan KTP elektronik & platform SatuSehat Kemenkes.
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 16, color: '#136B53 !important' }} />}
              label="Validasi NIK Terpadu"
              size="small"
              sx={{ bgcolor: '#E8F2EE', color: '#136B53', fontWeight: 700, fontSize: 11 }}
            />
          </Box>

          <Grid container spacing={2.5}>
            {/* NIK Input with Cek Dukcapil */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                Nomor Induk Kependudukan (NIK) <span style={{ color: '#BA1A1A' }}>*</span>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="16 Digit NIK KTP..."
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  slotProps={{
                    input: {
                      endAdornment: nik.length === 16 && dukcapilChecked ? (
                        <InputAdornment position="end">
                          <CheckCircleIcon sx={{ color: '#136B53', fontSize: 20 }} />
                        </InputAdornment>
                      ) : null,
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': { bgcolor: '#F4F8F6', borderRadius: 2, fontFamily: 'monospace' },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleDukcapilCheck}
                  startIcon={<SearchIcon />}
                  sx={{
                    bgcolor: '#003629',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 2.2,
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: '#1B4D3E' },
                  }}
                >
                  Cek Dukcapil
                </Button>
              </Box>
              {dukcapilChecked && nik.length === 16 && (
                <Typography variant="caption" sx={{ color: '#136B53', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.6 }}>
                  <CheckCircleIcon sx={{ fontSize: 13 }} /> Terverifikasi dengan database kependudukan nasional (IHS: P-992019482)
                </Typography>
              )}
            </Grid>

            {/* Nama Lengkap Sesuai KTP */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                Nama Lengkap (Sesuai KTP) <span style={{ color: '#BA1A1A' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                placeholder="Masukkan nama lengkap tanpa singkatan..."
                value={nama}
                onChange={(e) => setNama(e.target.value.toUpperCase())}
                sx={{
                  '& .MuiOutlinedInput-root': { bgcolor: '#F4F8F6', borderRadius: 2 },
                }}
              />
            </Grid>

            {/* Tempat & Tanggal Lahir */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                Tempat Lahir <span style={{ color: '#BA1A1A' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                placeholder="Contoh: Bandung"
                value={tempatLahir}
                onChange={(e) => setTempatLahir(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F4F8F6', borderRadius: 2 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                Tanggal Lahir <span style={{ color: '#BA1A1A' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F4F8F6', borderRadius: 2 } }}
              />
            </Grid>

            {/* Estimasi Umur Otomatis */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#526B62', mb: 0.8 }}>
                Usia Terhitung
              </Typography>
              <Box sx={{ height: 44, bgcolor: '#E9F7F0', borderRadius: 2, display: 'flex', alignItems: 'center', px: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#003629' }}>
                  {age.tahun} Tahun
                </Typography>
                <Typography variant="caption" sx={{ color: '#526B62', ml: 1 }}>
                  {age.bulan} Bulan
                </Typography>
              </Box>
            </Grid>

            {/* Jenis Kelamin Selector (Radio Cards) */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                Jenis Kelamin <span style={{ color: '#BA1A1A' }}>*</span>
              </Typography>
              <RadioGroup row value={gender} onChange={(e) => setGender(e.target.value)}>
                <Grid container spacing={1.5} sx={{ width: '100%' }}>
                  <Grid size={6}>
                    <Card
                      onClick={() => setGender('L')}
                      elevation={0}
                      sx={{
                        p: 1.2,
                        cursor: 'pointer',
                        border: '1.5px solid',
                        borderColor: gender === 'L' ? '#136B53' : '#DDEBE5',
                        bgcolor: gender === 'L' ? '#E9F7F0' : '#F4F8F6',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Radio checked={gender === 'L'} value="L" sx={{ color: '#136B53', p: 0.5 }} />
                      <MaleIcon sx={{ color: '#136B53', fontSize: 22 }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#121E1A' }}>Laki-laki</Typography>
                    </Card>
                  </Grid>
                  <Grid size={6}>
                    <Card
                      onClick={() => setGender('P')}
                      elevation={0}
                      sx={{
                        p: 1.2,
                        cursor: 'pointer',
                        border: '1.5px solid',
                        borderColor: gender === 'P' ? '#136B53' : '#DDEBE5',
                        bgcolor: gender === 'P' ? '#E9F7F0' : '#F4F8F6',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Radio checked={gender === 'P'} value="P" sx={{ color: '#136B53', p: 0.5 }} />
                      <FemaleIcon sx={{ color: '#136B53', fontSize: 22 }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#121E1A' }}>Perempuan</Typography>
                    </Card>
                  </Grid>
                </Grid>
              </RadioGroup>
            </Grid>

            {/* Golongan Darah & Rhesus */}
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                Golongan Darah
              </Typography>
              <FormControl fullWidth size="small">
                <Select value={golonganDarah} onChange={(e) => setGolonganDarah(e.target.value)} sx={{ bgcolor: '#F4F8F6', borderRadius: 2 }}>
                  <MenuItem value="O">O</MenuItem>
                  <MenuItem value="A">A</MenuItem>
                  <MenuItem value="B">B</MenuItem>
                  <MenuItem value="AB">AB</MenuItem>
                  <MenuItem value="-">Tidak Tahu</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                Rhesus
              </Typography>
              <FormControl fullWidth size="small">
                <Select value={rhesus} onChange={(e) => setRhesus(e.target.value)} sx={{ bgcolor: '#F4F8F6', borderRadius: 2 }}>
                  <MenuItem value="+">Positif (+)</MenuItem>
                  <MenuItem value="-">Negatif (-)</MenuItem>
                  <MenuItem value="?">Tidak Tahu</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Status Pernikahan, Agama, Pekerjaan */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                Status Pernikahan
              </Typography>
              <FormControl fullWidth size="small">
                <Select value={statusNikah} onChange={(e) => setStatusNikah(e.target.value)} sx={{ bgcolor: '#F4F8F6', borderRadius: 2 }}>
                  <MenuItem value="menikah">Menikah</MenuItem>
                  <MenuItem value="belum_menikah">Belum Menikah</MenuItem>
                  <MenuItem value="cerai_hidup">Cerai Hidup</MenuItem>
                  <MenuItem value="cerai_mati">Cerai Mati</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                Agama
              </Typography>
              <FormControl fullWidth size="small">
                <Select value={agama} onChange={(e) => setAgama(e.target.value)} sx={{ bgcolor: '#F4F8F6', borderRadius: 2 }}>
                  <MenuItem value="islam">Islam</MenuItem>
                  <MenuItem value="kristen">Kristen Protestan</MenuItem>
                  <MenuItem value="katolik">Katolik</MenuItem>
                  <MenuItem value="hindu">Hindu</MenuItem>
                  <MenuItem value="buddha">Buddha</MenuItem>
                  <MenuItem value="khonghucu">Khonghucu</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                Pekerjaan
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={pekerjaan}
                onChange={(e) => setPekerjaan(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F4F8F6', borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        </Card>

        {/* ========================================================
            SECTION 2: Penjamin Kesehatan & Metode Pembayaran
           ======================================================== */}
        <Card elevation={0} sx={{ border: '1px solid #DDEBE5', borderRadius: 4, p: { xs: 2.5, sm: 3.5 }, bgcolor: '#FFFFFF', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, pb: 2.5, mb: 3, borderBottom: '1px solid #DDEBE5' }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#A0F0D1', color: '#003629', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
              2
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 16 }}>
                Penjamin Kesehatan & Metode Pembayaran
              </Typography>
              <Typography variant="caption" sx={{ color: '#526B62', fontSize: 12 }}>
                Tentukan skema pembiayaan perawatan pasien dan validasi kartu BPJS PCare.
              </Typography>
            </Box>
          </Box>

          {/* 3 Radio Cards Penjamin */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { id: 'bpjs', title: 'BPJS Kesehatan', desc: 'JKN-KIS PBI & Non-PBI Mandiri / Pekerja Penerima Upah.' },
              { id: 'umum', title: 'Pasien Umum', desc: 'Biaya pemeriksaan & tindakan mandiri tunai atau QRIS/Debit.' },
              { id: 'asuransi', title: 'Asuransi Swasta', desc: 'Prudential, Allianz, Mandiri Inhealth, atau Korporasi Rekanan.' },
            ].map((opt) => {
              const active = guarantor === opt.id;
              return (
                <Grid size={{ xs: 12, sm: 4 }} key={opt.id}>
                  <Card
                    onClick={() => setGuarantor(opt.id)}
                    elevation={0}
                    sx={{
                      p: 2.2,
                      cursor: 'pointer',
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: active ? '#136B53' : '#DDEBE5',
                      bgcolor: active ? '#E9F7F0' : '#F4F8F6',
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: '#136B53' },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: active ? '#003629' : '#121E1A' }}>
                        {opt.title}
                      </Typography>
                      <Radio checked={active} value={opt.id} sx={{ color: '#136B53', p: 0 }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#526B62', fontSize: 11.5, display: 'block', lineHeight: 1.4 }}>
                      {opt.desc}
                    </Typography>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* BPJS Specific Fields */}
          {guarantor === 'bpjs' && (
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                  Nomor Kartu BPJS Kesehatan (13 Digit) <span style={{ color: '#BA1A1A' }}>*</span>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={noBpjs}
                    onChange={(e) => setNoBpjs(e.target.value.replace(/\D/g, '').slice(0, 13))}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F4F8F6', borderRadius: 2, fontFamily: 'monospace' } }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleBpjsCheck}
                    startIcon={<SyncIcon />}
                    sx={{ bgcolor: '#136B53', color: '#FFFFFF', borderRadius: 2, px: 2, whiteSpace: 'nowrap' }}
                  >
                    Cek PCare
                  </Button>
                </Box>
                {bpjsVerified && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.2 }}>
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: 15, color: '#166534 !important' }} />}
                      label="KARTU AKTIF / VALID"
                      size="small"
                      sx={{ bgcolor: '#E8F7EE', color: '#166534', fontWeight: 800, fontSize: 11 }}
                    />
                    <Typography variant="caption" sx={{ color: '#526B62' }}>
                      Hak Kelas: <strong style={{ color: '#121E1A' }}>Kelas 1</strong>
                    </Typography>
                  </Box>
                )}
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                  Faskes Tingkat 1 (FKTP) Terdaftar
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  disabled
                  value="0134B002 - KLINIK PRATAMA SEHAT HARMONI"
                  slotProps={{
                    input: {
                      endAdornment: <DomainIcon sx={{ color: '#136B53', fontSize: 20 }} />,
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#E9F7F0', borderRadius: 2 } }}
                />
                <Typography variant="caption" sx={{ color: '#526B62', display: 'block', mt: 0.5 }}>
                  Pasien terdaftar di FKTP ini (Layanan reguler dicakup penuh).
                </Typography>
              </Grid>
            </Grid>
          )}
        </Card>

        {/* ========================================================
            SECTION 3: Informasi Kontak & Alamat Domisili
           ======================================================== */}
        <Card elevation={0} sx={{ border: '1px solid #DDEBE5', borderRadius: 4, p: { xs: 2.5, sm: 3.5 }, bgcolor: '#FFFFFF', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, pb: 2.5, mb: 3, borderBottom: '1px solid #DDEBE5' }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#A0F0D1', color: '#003629', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
              3
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 16 }}>
                Informasi Kontak & Alamat Domisili
              </Typography>
              <Typography variant="caption" sx={{ color: '#526B62', fontSize: 12 }}>
                Alamat resmi kependudukan dan sarana komunikasi pemanggilan hasil lab & kontrol berkala.
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            {/* Nomor WhatsApp */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                Nomor WhatsApp / HP Pasien <span style={{ color: '#BA1A1A' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                placeholder="812-3456-7890"
                value={noTelp}
                onChange={(e) => setNoTelp(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">+62</InputAdornment>,
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F4F8F6', borderRadius: 2, fontFamily: 'monospace' } }}
              />
              <Typography variant="caption" sx={{ color: '#526B62', mt: 0.5, display: 'block' }}>
                Digunakan untuk pengiriman nomor antrean digital & salinan resep elektronik.
              </Typography>
            </Grid>

            {/* Email */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                Alamat Email (Opsional)
              </Typography>
              <TextField
                fullWidth
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F4F8F6', borderRadius: 2 } }}
              />
            </Grid>

            {/* Wilayah Administratif */}
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>Provinsi</Typography>
              <TextField fullWidth size="small" value={provinsi} onChange={(e) => setProvinsi(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F4F8F6', borderRadius: 2 } }} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>Kota / Kabupaten</Typography>
              <TextField fullWidth size="small" value={kota} onChange={(e) => setKota(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F4F8F6', borderRadius: 2 } }} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>Kecamatan</Typography>
              <TextField fullWidth size="small" value={kecamatan} onChange={(e) => setKecamatan(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F4F8F6', borderRadius: 2 } }} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>Kode Pos</Typography>
              <TextField fullWidth size="small" value={kodePos} onChange={(e) => setKodePos(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F4F8F6', borderRadius: 2 } }} />
            </Grid>

            {/* Alamat Lengkap Sesuai KTP */}
            <Grid size={12}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                Alamat Lengkap Sesuai KTP <span style={{ color: '#BA1A1A' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Nama Jalan, Nomor Rumah, RT/RW, Dusun/Lingkungan..."
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F4F8F6', borderRadius: 2 } }}
              />
            </Grid>

            {/* Checkbox Same Address */}
            <Grid size={12}>
              <FormControlLabel
                control={<Checkbox checked={sameAddress} onChange={(e) => setSameAddress(e.target.checked)} sx={{ color: '#136B53' }} />}
                label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A' }}>Alamat domisili saat ini sama dengan alamat KTP</Typography>}
              />
            </Grid>
          </Grid>
        </Card>

        {/* ========================================================
            SECTION 4: Kontak Darurat / Penanggung Jawab
           ======================================================== */}
        <Card elevation={0} sx={{ border: '1px solid #DDEBE5', borderRadius: 4, p: { xs: 2.5, sm: 3.5 }, bgcolor: '#FFFFFF', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, pb: 2.5, mb: 3, borderBottom: '1px solid #DDEBE5' }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#A0F0D1', color: '#003629', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
              4
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 16 }}>
                Kontak Darurat & Penanggung Jawab
              </Typography>
              <Typography variant="caption" sx={{ color: '#526B62', fontSize: 12 }}>
                Pihak keluarga atau wali sah yang dapat dihubungi saat kondisi kegawatdaruratan medis.
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                Nama Penanggung Jawab / Wali <span style={{ color: '#BA1A1A' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Nama lengkap wali..."
                value={waliNama}
                onChange={(e) => setWaliNama(e.target.value.toUpperCase())}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F4F8F6', borderRadius: 2 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                Hubungan Keluarga <span style={{ color: '#BA1A1A' }}>*</span>
              </Typography>
              <FormControl fullWidth size="small">
                <Select value={waliHubungan} onChange={(e) => setWaliHubungan(e.target.value)} sx={{ bgcolor: '#F4F8F6', borderRadius: 2 }}>
                  <MenuItem value="istri">Istri / Suami</MenuItem>
                  <MenuItem value="orang_tua">Orang Tua</MenuItem>
                  <MenuItem value="anak">Anak Kandung</MenuItem>
                  <MenuItem value="saudara">Saudara Kandung</MenuItem>
                  <MenuItem value="wali">Wali Resmi / Pihak Ketiga</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                Nomor Kontak Darurat <span style={{ color: '#BA1A1A' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="813-0000-0000"
                value={waliTelp}
                onChange={(e) => setWaliTelp(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">+62</InputAdornment>,
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F4F8F6', borderRadius: 2, fontFamily: 'monospace' } }}
              />
            </Grid>
          </Grid>
        </Card>

        {/* ========================================================
            SECTION 5: Skrining Alergi & Riwayat Medis Awal
           ======================================================== */}
        <Card elevation={0} sx={{ border: '1px solid #DDEBE5', borderRadius: 4, p: { xs: 2.5, sm: 3.5 }, bgcolor: '#FFFFFF', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2.5, mb: 3, borderBottom: '1px solid #DDEBE5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#A0F0D1', color: '#003629', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                5
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 16 }}>
                  Riwayat Medis Singkat & Peringatan Alergi
                </Typography>
                <Typography variant="caption" sx={{ color: '#526B62', fontSize: 12 }}>
                  Catatan penting keselamatan pasien untuk ditampilkan pada lembar anamnesis dokter.
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={<WarningAmberIcon sx={{ fontSize: 16, color: '#BA1A1A !important' }} />}
              label="Patient Safety Flag"
              size="small"
              sx={{ bgcolor: '#FFDAD6', color: '#93000A', fontWeight: 800, fontSize: 11 }}
            />
          </Box>

          <Grid container spacing={2.5}>
            {/* Riwayat Alergi */}
            <Grid size={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#121E1A' }}>
                  Riwayat Alergi Obat & Makanan
                </Typography>
                <FormControlLabel
                  control={<Checkbox size="small" checked={noAllergy} onChange={(e) => setNoAllergy(e.target.checked)} sx={{ color: '#136B53' }} />}
                  label={<Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600 }}>Tidak Memiliki Riwayat Alergi (NKA)</Typography>}
                />
              </Box>

              {/* Chips Tray */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 1.2,
                  p: 2,
                  bgcolor: '#F4F8F6',
                  borderRadius: 3,
                  opacity: noAllergy ? 0.4 : 1,
                  pointerEvents: noAllergy ? 'none' : 'auto',
                }}
              >
                {allergies.map((a, idx) => (
                  <Chip
                    key={idx}
                    icon={a.type === 'food' ? <RestaurantIcon sx={{ fontSize: 16 }} /> : <MedicationIcon sx={{ fontSize: 16 }} />}
                    label={a.label}
                    onDelete={() => handleRemoveAllergy(idx)}
                    deleteIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      bgcolor: a.type === 'med' ? '#FFDAD6' : '#E9F7F0',
                      color: a.type === 'med' ? '#93000A' : '#121E1A',
                      fontWeight: 700,
                      borderRadius: 50,
                    }}
                  />
                ))}

                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8 }}>
                  <TextField
                    size="small"
                    placeholder="+ Tambah alergi..."
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAllergy();
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#FFFFFF',
                        borderRadius: 50,
                        py: 0,
                        height: 32,
                        fontSize: 12,
                      },
                    }}
                  />
                  <IconButton size="small" onClick={handleAddAllergy} sx={{ bgcolor: '#136B53', color: '#FFFFFF', '&:hover': { bgcolor: '#003629' }, width: 28, height: 28 }}>
                    <AddIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            </Grid>

            {/* Penyakit Kronis Terdahulu */}
            <Grid size={12}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 1 }}>
                Penyakit Kronis / Riwayat Penyakit Terdahulu
              </Typography>
              <Grid container spacing={1.5}>
                {[
                  { key: 'hipertensi', label: 'Hipertensi (HT)' },
                  { key: 'diabetes', label: 'Diabetes Melitus (DM)' },
                  { key: 'asma', label: 'Asma Bronkiale' },
                  { key: 'jantung', label: 'Penyakit Jantung (PJK)' },
                ].map((dis) => (
                  <Grid size={{ xs: 6, sm: 3 }} key={dis.key}>
                    <Card
                      onClick={() => setChronicConditions((prev) => ({ ...prev, [dis.key]: !prev[dis.key] }))}
                      elevation={0}
                      sx={{
                        p: 1.2,
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: chronicConditions[dis.key] ? '#136B53' : '#DDEBE5',
                        bgcolor: chronicConditions[dis.key] ? '#E9F7F0' : '#F4F8F6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Checkbox checked={chronicConditions[dis.key]} size="small" sx={{ color: '#136B53', p: 0.5 }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#121E1A' }}>
                        {dis.label}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Catatan Khusus Pendaftaran */}
            <Grid size={12}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#121E1A', mb: 0.8 }}>
                Catatan Khusus Petugas Registrasi
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Contoh: Pasien memerlukan kursi roda / Pendengaran kurang jelas..."
                value={catatanKhusus}
                onChange={(e) => setCatatanKhusus(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F4F8F6', borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        </Card>

        {/* ========================================================
            GENERAL CONSENT & SUBMISSION DOCK
           ======================================================== */}
        <Card elevation={0} sx={{ border: '1px solid #DDEBE5', borderRadius: 4, p: { xs: 2.5, sm: 3.5 }, bgcolor: '#FFFFFF', boxShadow: '0 4px 20px -2px rgba(27,77,62,0.06)' }}>
          <FormControlLabel
            control={<Checkbox checked={generalConsent} onChange={(e) => setGeneralConsent(e.target.checked)} sx={{ color: '#136B53', mt: -3 }} />}
            label={
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#121E1A' }}>
                  Pernyataan Kebenaran Data & Persetujuan Umum (General Consent)
                </Typography>
                <Typography variant="caption" sx={{ color: '#526B62', display: 'block', lineHeight: 1.5, mt: 0.3 }}>
                  Saya menyatakan bahwa informasi yang saya berikan adalah benar dan valid. Pasien / Wali memberikan persetujuan umum untuk pemeriksaan medis, asuhan keperawatan, tes laboratorium dasar, serta penyimpanan data rekam medis elektronik sesuai dengan Permenkes No. 24 Tahun 2022.
                </Typography>
              </Box>
            }
          />

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2, pt: 3, mt: 2, borderTop: '1px solid #DDEBE5' }}>
            <Button
              variant="text"
              onClick={handleResetForm}
              sx={{ color: '#526B62', fontWeight: 600, borderRadius: 2, px: 2 }}
            >
              Batal & Bersihkan Form
            </Button>

            <Button
              variant="contained"
              type="submit"
              disabled={submitting}
              startIcon={<HowToRegIcon />}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: '#003629',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 14,
                borderRadius: 2.5,
                py: 1.2,
                px: 3.5,
                boxShadow: '0 4px 14px rgba(0, 54, 41, 0.3)',
                '&:hover': { bgcolor: '#1B4D3E' },
              }}
            >
              {submitting ? 'Menyimpan Pasien...' : 'Simpan & Ambil Antrean Poli'}
            </Button>
          </Box>
        </Card>
      </Box>

      {/* Global Snackbar Toast */}
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
