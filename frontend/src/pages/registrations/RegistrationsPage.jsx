import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Grid, Card, CardContent,
  Chip, Radio, Checkbox, IconButton, InputAdornment,
  Alert, Snackbar, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper, MenuItem, Select, FormControl,
} from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import ChildCareOutlinedIcon from '@mui/icons-material/ChildCareOutlined';
import PregnantWomanOutlinedIcon from '@mui/icons-material/PregnantWomanOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useAuth } from '../../context/AuthContext';
import { getRegistrations, createRegistration, updateRegistration } from '../../api/registrations.api';
import { getQueues, createQueue, callQueue } from '../../api/queues.api';
import { getPatients, getPatientById } from '../../api/patients.api';
import { getPoli } from '../../api/poli.api';
import { getDoctors } from '../../api/doctors.api';

// Metadata Poliklinik sesuai Master Data Proyek
const POLI_METADATA = {
  UMU: {
    icon: MedicalServicesOutlinedIcon,
    sub: 'Pelayanan dokter umum, surat sakit, pemeriksaan keluhan dasar',
    room: 'Ruang Periksa 1 (Lantai 1)',
    shift: '08:00 - 14:00 WIB',
    estMinsPerQueue: 10,
  },
  GGI: {
    icon: HealthAndSafetyOutlinedIcon,
    sub: 'Pemeriksaan gigi, tambal, scaling, pencabutan & perawatan gusi',
    room: 'Ruang Gigi & Mulut (Lantai 1)',
    shift: '09:00 - 15:00 WIB',
    estMinsPerQueue: 15,
  },
  ANK: {
    icon: ChildCareOutlinedIcon,
    sub: 'Tumbuh kembang, vaksinasi lengkap, batuk pilek anak & nutrisi',
    room: 'Ruang Tumbuh Kembang (Lantai 2)',
    shift: '08:30 - 13:30 WIB',
    estMinsPerQueue: 12,
  },
  KIA: {
    icon: PregnantWomanOutlinedIcon,
    sub: 'Pemeriksaan kehamilan, USG dasar, KB & kesehatan ibu dan anak',
    room: 'Ruang Kebidanan & Kandungan (Lantai 2)',
    shift: '10:00 - 16:00 WIB',
    estMinsPerQueue: 15,
  },
};

const VISIT_TYPES = [
  {
    id: 'KONSULTASI_BARU',
    title: 'Konsultasi & Sakit Baru',
    sub: 'Pemeriksaan gejala awal / keluhan akut',
  },
  {
    id: 'KONTROL_RUTIN',
    title: 'Kontrol Rutin / Pasca Rawat',
    sub: 'Evaluasi terapi berkala atau luka jahitan',
  },
  {
    id: 'RUJUKAN_LAB',
    title: 'Rujukan Lab / Tindakan Medis',
    sub: 'Permintaan cek darah, urine, atau EKG',
  },
  {
    id: 'IMUNISASI_SEHAT',
    title: 'Imunisasi / Surat Keterangan',
    sub: 'Suntik vitamin, vaksin, atau cek sehat',
  },
];

const STATUS_COLOR = {
  MENUNGGU: 'default',
  CHECK_IN: 'info',
  PEMERIKSAAN: 'primary',
  SELESAI: 'success',
};

const STATUS_LABEL = {
  MENUNGGU: 'Menunggu',
  CHECK_IN: 'Check In',
  PEMERIKSAAN: 'Pemeriksaan',
  SELESAI: 'Selesai',
};

function calculateAge(dob) {
  if (!dob) return '-';
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export default function RegistrationsPage() {
  const { user } = useAuth();
  const isPetugas = user?.role === 'PETUGAS' || user?.role === 'ADMIN';
  const isDokter = user?.role === 'DOKTER';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode View: 'baru' (Wireframe Ambil Antrean) vs 'daftar' (Tabel Antrean Hari Ini)
  const [activeTab, setActiveTab] = useState('baru');

  // Master Data
  const [polis, setPolis] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [queues, setQueues] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Search & Selected Patient State
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Form State
  const [selectedPoliId, setSelectedPoliId] = useState(1);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [visitType, setVisitType] = useState('KONSULTASI_BARU');
  const [penjamin, setPenjamin] = useState('BPJS');
  const [keluhanAwal, setKeluhanAwal] = useState('');

  // Delivery & Print Options
  const [printThermal, setPrintThermal] = useState(true);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [sendSms, setSendSms] = useState(false);

  // Status & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Ticket Modal after successful queue creation
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [issuedTicket, setIssuedTicket] = useState(null);

  // Live Clock for Ticket Header
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const searchTimerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch Master Data: Polis, Doctors, Queues, Registrations
  const fetchAllData = useCallback(async () => {
    try {
      setLoadingData(true);
      const todayISO = new Date().toISOString().slice(0, 10);
      const [polisRes, docsRes, queuesRes, regsRes] = await Promise.all([
        getPoli(),
        getDoctors(),
        getQueues({ tanggal: todayISO }).catch(() => ({ data: [] })),
        getRegistrations({ tanggal: todayISO }).catch(() => ({ data: [] })),
      ]);

      const poliList = polisRes.data || [];
      const docList = docsRes.data || [];
      setPolis(poliList);
      setDoctors(docList);
      setQueues(queuesRes.data || []);
      setRegistrations(regsRes.data || []);

      // Default selection if not already selected
      if (poliList.length > 0 && !selectedPoliId) {
        setSelectedPoliId(poliList[0].id);
      }
    } catch {
      setSnackbar({ open: true, message: 'Gagal memuat data antrean dan poliklinik', severity: 'error' });
    } finally {
      setLoadingData(false);
    }
  }, [selectedPoliId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle URL Query Params (e.g. from PatientsPage or PatientRegistrationPage)
  useEffect(() => {
    const queryPatientId = searchParams.get('patientId');
    const queryPenjamin = searchParams.get('penjamin');

    if (queryPenjamin && ['BPJS', 'UMUM', 'ASURANSI'].includes(queryPenjamin.toUpperCase())) {
      setPenjamin(queryPenjamin.toUpperCase());
    }

    if (queryPatientId) {
      getPatientById(queryPatientId)
        .then((res) => {
          if (res.data) {
            setSelectedPatient(res.data);
            setPatientSearch(res.data.noRm || res.data.nama);
          }
        })
        .catch(() => {
          // If not found by ID, ignore
        });
    }
  }, [searchParams]);

  // Synchronize doctor selection when selectedPoliId changes
  const activePoliDoctors = useMemo(() => {
    return doctors.filter((doc) => doc.poliId === Number(selectedPoliId));
  }, [doctors, selectedPoliId]);

  useEffect(() => {
    if (activePoliDoctors.length > 0) {
      // If current selected doctor is not in active poli, select the first one
      const docExists = activePoliDoctors.some((d) => d.id === Number(selectedDoctorId));
      if (!docExists) {
        setSelectedDoctorId(activePoliDoctors[0].id);
      }
    } else {
      setSelectedDoctorId('');
    }
  }, [activePoliDoctors, selectedDoctorId]);

  // Selected Poli Object
  const selectedPoli = useMemo(() => {
    return polis.find((p) => p.id === Number(selectedPoliId)) || polis[0] || null;
  }, [polis, selectedPoliId]);

  // Selected Doctor Object
  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => d.id === Number(selectedDoctorId)) || activePoliDoctors[0] || null;
  }, [doctors, selectedDoctorId, activePoliDoctors]);

  // Calculate Waiting Queues & Estimated Times for Selected Poli
  const poliQueues = useMemo(() => {
    if (!selectedPoli) return [];
    return queues.filter((q) => q.poliId === selectedPoli.id);
  }, [queues, selectedPoli]);

  const waitingCount = useMemo(() => {
    return poliQueues.filter((q) => q.status === 'MENUNGGU').length;
  }, [poliQueues]);

  const metaPoli = selectedPoli ? (POLI_METADATA[selectedPoli.kodePoli] || POLI_METADATA.UMU) : POLI_METADATA.UMU;

  // Next Predicted Queue Number (e.g. UMU-001)
  const previewQueueNumber = useMemo(() => {
    const prefix = selectedPoli?.kodePoli || 'UMU';
    const nextSeq = poliQueues.length + 1;
    return `${prefix}-${String(nextSeq).padStart(3, '0')}`;
  }, [selectedPoli, poliQueues]);

  // Estimated Serve Time (Live)
  const estimatedServeTime = useMemo(() => {
    const minsPerPatient = metaPoli.estMinsPerQueue || 10;
    const totalMinutes = Math.max(minsPerPatient, waitingCount * minsPerPatient);
    const estDate = new Date(currentTime.getTime() + totalMinutes * 60000);
    return `${String(estDate.getHours()).padStart(2, '0')}:${String(estDate.getMinutes()).padStart(2, '0')} WIB`;
  }, [currentTime, waitingCount, metaPoli]);

  // Debounced Patient Search
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setPatientSearch(val);

    clearTimeout(searchTimerRef.current);
    if (!val || val.trim().length < 2) {
      setPatientResults([]);
      setIsDropdownOpen(false);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await getPatients({ search: val.trim(), limit: 6 });
        const patients = res.data?.patients || [];
        setPatientResults(patients);
        setIsDropdownOpen(true);
      } catch {
        setPatientResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  };

  const handleSelectPatient = (p) => {
    setSelectedPatient(p);
    setPatientSearch(`${p.nama} (${p.noRm})`);
    setIsDropdownOpen(false);
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setPatientSearch('');
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Submit Registration & Generate Queue
  const handleSubmitQueue = async (e) => {
    if (e) e.preventDefault();

    if (!selectedPatient) {
      setSnackbar({ open: true, message: 'Silakan cari dan pilih data pasien terlebih dahulu', severity: 'warning' });
      return;
    }
    if (!selectedPoli) {
      setSnackbar({ open: true, message: 'Silakan pilih poliklinik tujuan', severity: 'warning' });
      return;
    }
    if (!selectedDoctor) {
      setSnackbar({ open: true, message: 'Silakan pilih dokter jaga yang bertugas', severity: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      const todayISO = new Date().toISOString().slice(0, 10);
      const selectedVisitObj = VISIT_TYPES.find((v) => v.id === visitType);
      const combinedKeluhan = keluhanAwal.trim()
        ? `[${selectedVisitObj?.title || 'Konsultasi'}] ${keluhanAwal.trim()}`
        : selectedVisitObj?.title || 'Konsultasi Pasien Rawat Jalan';

      // 1. Buat Pendaftaran
      const regPayload = {
        patientId: Number(selectedPatient.id),
        doctorId: Number(selectedDoctor.id),
        poliId: Number(selectedPoli.id),
        tanggalKunjungan: todayISO,
        jenisPembayaran: penjamin,
        keluhanAwal: combinedKeluhan,
      };

      const regRes = await createRegistration(regPayload);
      const registrationId = regRes.data?.id;

      // 2. Buat Nomor Antrean Otomatis
      const queueRes = await createQueue(registrationId);
      const queueData = queueRes.data;

      // 3. Simpan data tiket untuk modal cetak
      const ticketInfo = {
        nomorAntrean: queueData?.nomorAntrean || previewQueueNumber,
        noRegistrasi: regRes.data?.noRegistrasi,
        poliNama: selectedPoli.namaPoli,
        ruangPraktek: metaPoli.room,
        dokterNama: selectedDoctor.nama,
        pasienNama: selectedPatient.nama,
        pasienNoRm: selectedPatient.noRm,
        penjamin,
        antreanDiDepan: waitingCount,
        estimasiWaktu: estimatedServeTime,
        waktuCetak: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }) + ` • ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}:${String(new Date().getSeconds()).padStart(2, '0')} WIB • Loket 01`,
        noHp: selectedPatient.noTelp,
      };

      setIssuedTicket(ticketInfo);
      setTicketModalOpen(true);
      setSnackbar({ open: true, message: `Berhasil menerbitkan antrean ${ticketInfo.nomorAntrean}`, severity: 'success' });

      // Refresh master antrean
      fetchAllData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal menerbitkan nomor antrean';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSelectedPatient(null);
    setPatientSearch('');
    setKeluhanAwal('');
    setVisitType('KONSULTASI_BARU');
  };

  const handlePrintAction = () => {
    window.print();
  };

  // Queue List Actions
  const handleCheckIn = async (reg) => {
    setActionLoadingId(reg.id);
    try {
      await updateRegistration(reg.id, { status: 'CHECK_IN' });
      setSnackbar({ open: true, message: `${reg.patient.nama} berhasil check-in`, severity: 'success' });
      fetchAllData();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Gagal check-in', severity: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCall = async (reg) => {
    setActionLoadingId(reg.id);
    try {
      await callQueue(reg.queue.id);
      setSnackbar({ open: true, message: `Antrean ${reg.queue.nomorAntrean} berhasil dipanggil`, severity: 'success' });
      fetchAllData();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Gagal memanggil antrean', severity: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleFinish = async (reg) => {
    setActionLoadingId(reg.id);
    try {
      await updateRegistration(reg.id, { status: 'SELESAI' });
      setSnackbar({ open: true, message: 'Kunjungan pasien selesai', severity: 'success' });
      fetchAllData();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Gagal menyelesaikan kunjungan', severity: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredRegistrations = useMemo(() => {
    if (!statusFilter) return registrations;
    return registrations.filter((r) => r.status === statusFilter);
  }, [registrations, statusFilter]);

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', pb: 6, pt: 1 }}>
      {/* 1. Breadcrumbs & Header Bar */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 3.5 }}>
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
            <Typography variant="caption" sx={{ color: '#526B62' }}>Pendaftaran & Antrean</Typography>
            <Typography variant="caption" sx={{ color: '#707974' }}>/</Typography>
            <Typography variant="caption" sx={{ color: '#1B4D3E', fontWeight: 700 }}>Ambil Antrean Baru</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1B4D3E', letterSpacing: -0.5, fontSize: { xs: '1.6rem', md: '1.9rem' } }}>
            Pendaftaran & Ambil Antrean Baru
          </Typography>
          <Typography variant="body2" sx={{ color: '#526B62', mt: 0.3, fontSize: 13.5, maxWidth: 850 }}>
            Pilih status kepesertaan pasien, tentukan poliklinik tujuan, dokter yang bertugas, dan terbitkan nomor antrean rawat jalan secara terpadu.
          </Typography>
        </Box>

        {/* View Toggle (Ambil Antrean Baru vs Daftar Antrean Aktif) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#FFFFFF', p: 0.5, borderRadius: 2.5, border: '1px solid #D1DED8', boxShadow: '0 2px 8px -2px rgba(27, 77, 62, 0.05)' }}>
          <Button
            size="small"
            onClick={() => setActiveTab('baru')}
            startIcon={<AddCircleOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: activeTab === 'baru' ? '#1B4D3E' : 'transparent',
              color: activeTab === 'baru' ? '#FFFFFF' : '#526B62',
              fontWeight: 700,
              fontSize: 13,
              borderRadius: 2,
              px: 2,
              py: 0.8,
              '&:hover': { bgcolor: activeTab === 'baru' ? '#133D31' : '#F0F5F2' },
            }}
          >
            Ambil Antrean Baru
          </Button>
          <Button
            size="small"
            onClick={() => setActiveTab('daftar')}
            startIcon={<FormatListBulletedIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: activeTab === 'daftar' ? '#1B4D3E' : 'transparent',
              color: activeTab === 'daftar' ? '#FFFFFF' : '#526B62',
              fontWeight: 700,
              fontSize: 13,
              borderRadius: 2,
              px: 2,
              py: 0.8,
              '&:hover': { bgcolor: activeTab === 'daftar' ? '#133D31' : '#F0F5F2' },
            }}
          >
            Daftar Antrean Hari Ini ({registrations.length})
          </Button>
        </Box>
      </Box>

      {/* 2. Content: Ambil Antrean Baru (2 Kolom Wireframe) */}
      {activeTab === 'baru' ? (
        <Grid container spacing={3.5} alignItems="flex-start">
          {/* LEFT COLUMN: 7 COLS (FORM & TRIAGE SELECTION) */}
          <Grid size={{ xs: 12, lg: 7 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {/* STEP 1: IDENTIFIKASI & PENCARIAN PASIEN */}
            <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 12px -2px rgba(27, 77, 62, 0.05)' }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2, mb: 2.5, borderBottom: '1px solid #F0F5F2' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: '#1B4D3E',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 14,
                      }}
                    >
                      1
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 16 }}>
                        Identifikasi & Pencarian Pasien
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#526B62', fontSize: 12.5 }}>
                        Tentukan status data rekam medis pasien sebelum diterbitkan tiket antrean
                      </Typography>
                    </Box>
                  </Box>
                  <Chip label="Wajib" size="small" sx={{ bgcolor: '#E8F2EE', color: '#1B4D3E', fontWeight: 700, fontSize: 11 }} />
                </Box>

                {/* Instant Search Bar */}
                <Box ref={dropdownRef} sx={{ position: 'relative', mb: 2.5 }}>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <TextField
                      fullWidth
                      value={patientSearch}
                      onChange={handleSearchChange}
                      placeholder="Ketik No. RM, NIK 16-digit, atau Nama Pasien..."
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <BadgeOutlinedIcon sx={{ color: '#526B62', fontSize: 20 }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              {searchLoading && <CircularProgress size={16} sx={{ color: '#1B4D3E', mr: 0.5 }} />}
                              {patientSearch && (
                                <IconButton size="small" onClick={handleClearPatient}>
                                  <CloseIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{
                        bgcolor: '#FFFFFF',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          fontSize: 14,
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => {
                        if (patientSearch.trim().length >= 2) {
                          setSearchLoading(true);
                          getPatients({ search: patientSearch.trim(), limit: 6 })
                            .then((res) => {
                              setPatientResults(res.data?.patients || []);
                              setIsDropdownOpen(true);
                            })
                            .finally(() => setSearchLoading(false));
                        }
                      }}
                      startIcon={<SearchIcon sx={{ fontSize: 18 }} />}
                      sx={{
                        bgcolor: '#1B4D3E',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        px: 2.5,
                        borderRadius: 2,
                        flexShrink: 0,
                        '&:hover': { bgcolor: '#133D31' },
                      }}
                    >
                      Cari Data
                    </Button>
                  </Box>

                  {/* Dropdown Suggestions */}
                  {isDropdownOpen && (
                    <Paper
                      elevation={4}
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        mt: 0.8,
                        zIndex: 20,
                        borderRadius: 2,
                        border: '1px solid #D1DED8',
                        maxHeight: 280,
                        overflowY: 'auto',
                        p: 0.5,
                      }}
                    >
                      {patientResults.length === 0 ? (
                        <Box sx={{ p: 2.5, textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ color: '#526B62', mb: 1.5 }}>
                            Pasien tidak ditemukan dengan kata kunci &quot;{patientSearch}&quot;
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PersonAddOutlinedIcon sx={{ fontSize: 16 }} />}
                            onClick={() => navigate('/patients/new')}
                            sx={{ borderColor: '#1B4D3E', color: '#1B4D3E', fontWeight: 700 }}
                          >
                            Daftarkan Pasien Baru
                          </Button>
                        </Box>
                      ) : (
                        patientResults.map((p) => (
                          <Box
                            key={p.id}
                            onClick={() => handleSelectPatient(p)}
                            sx={{
                              p: 1.2,
                              px: 1.8,
                              borderRadius: 1.5,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.15s',
                              '&:hover': { bgcolor: '#F0F5F2' },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: '50%',
                                  bgcolor: '#E8F2EE',
                                  color: '#1B4D3E',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: 13,
                                }}
                              >
                                {p.nama.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#121E1A' }}>
                                  {p.nama}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#526B62' }}>
                                  No. RM: <strong>{p.noRm}</strong> • NIK: {p.nik}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              size="small"
                              label={`${calculateAge(p.tanggalLahir)} th • ${p.jenisKelamin === 'L' ? 'L' : 'P'}`}
                              sx={{ bgcolor: '#E8F2EE', color: '#1B4D3E', fontWeight: 600, fontSize: 11 }}
                            />
                          </Box>
                        ))
                      )}
                    </Paper>
                  )}
                </Box>

                {/* Patient Verified Preview Card */}
                {selectedPatient ? (
                  <Box
                    sx={{
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 2.5,
                      bgcolor: '#F8FAF9',
                      border: '1px solid #D1DED8',
                      p: 2.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: '#1B4D3E',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 17,
                            flexShrink: 0,
                          }}
                        >
                          {selectedPatient.nama.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 16.5 }}>
                              {selectedPatient.nama}
                            </Typography>
                            <Chip
                              size="small"
                              icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#136B53 !important' }} />}
                              label={penjamin === 'BPJS' ? 'Terverifikasi BPJS' : penjamin === 'ASURANSI' ? 'Asuransi Swasta' : 'Pasien Umum'}
                              sx={{ bgcolor: '#E8F2EE', color: '#136B53', fontWeight: 700, fontSize: 11 }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#526B62', fontSize: 12.5, mt: 0.3 }}>
                            <span>{calculateAge(selectedPatient.tanggalLahir)} Tahun</span>
                            <span>•</span>
                            <span>{selectedPatient.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                            <span>•</span>
                            <span style={{ color: '#1B4D3E', fontWeight: 800 }}>{selectedPatient.noRm}</span>
                          </Box>
                        </Box>
                      </Box>
                      <Button
                        size="small"
                        onClick={handleClearPatient}
                        startIcon={<SyncIcon sx={{ fontSize: 15 }} />}
                        sx={{ color: '#136B53', fontWeight: 700, fontSize: 12, textDecoration: 'underline' }}
                      >
                        Ganti
                      </Button>
                    </Box>

                    {/* Patient Info Grid */}
                    <Grid container spacing={1.5} sx={{ pt: 0.5 }}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#FFFFFF', p: 1.2, px: 1.5, borderRadius: 1.8, border: '1px solid #E5EDE9' }}>
                          <CreditCardOutlinedIcon sx={{ color: '#526B62', fontSize: 17 }} />
                          <Typography variant="caption" sx={{ color: '#526B62', fontSize: 12 }}>
                            NIK: <strong style={{ color: '#121E1A' }}>{selectedPatient.nik || '-'}</strong>
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#FFFFFF', p: 1.2, px: 1.5, borderRadius: 1.8, border: '1px solid #E5EDE9' }}>
                          <PhoneOutlinedIcon sx={{ color: '#526B62', fontSize: 17 }} />
                          <Typography variant="caption" sx={{ color: '#526B62', fontSize: 12 }}>
                            WhatsApp: <strong style={{ color: '#121E1A' }}>{selectedPatient.noTelp || '-'}</strong>
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#FFFFFF', p: 1.2, px: 1.5, borderRadius: 1.8, border: '1px solid #E5EDE9' }}>
                          <LocationOnOutlinedIcon sx={{ color: '#526B62', fontSize: 17, flexShrink: 0 }} />
                          <Typography variant="caption" sx={{ color: '#526B62', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            Alamat: <span style={{ color: '#121E1A' }}>{selectedPatient.alamat || '-'}</span>
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Medical Alert / Safety Badge */}
                    <Box
                      sx={{
                        mt: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.2,
                        px: 1.5,
                        borderRadius: 1.8,
                        bgcolor: '#FEF2F2',
                        border: '1px solid #FEE2E2',
                        color: '#991B1B',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningAmberIcon sx={{ fontSize: 18, color: '#DC2626' }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 12 }}>
                          Catatan Keselamatan Pasien:
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: 12 }}>
                          {selectedPatient.alergi || 'Alergi Amoksisilin & Penicillin derivatif'}
                        </Typography>
                      </Box>
                      <Chip label="Alergi Obat" size="small" sx={{ bgcolor: '#DC2626', color: '#FFFFFF', fontWeight: 700, fontSize: 10.5, height: 22 }} />
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2.5,
                      bgcolor: '#F8FAF9',
                      border: '1px dashed #C0D0C8',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#526B62', mb: 1 }}>
                      Belum ada pasien yang dipilih. Cari data pasien terdaftar atau buat pendaftaran baru.
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<PersonAddOutlinedIcon sx={{ fontSize: 16 }} />}
                      onClick={() => navigate('/patients/new')}
                      sx={{ borderColor: '#1B4D3E', color: '#1B4D3E', fontWeight: 700, mt: 0.5 }}
                    >
                      Pendaftaran Pasien Baru
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* STEP 2: PILIH POLIKLINIK & DOKTER */}
            <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 12px -2px rgba(27, 77, 62, 0.05)' }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2, mb: 2.5, borderBottom: '1px solid #F0F5F2' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: '#1B4D3E',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 14,
                      }}
                    >
                      2
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 16 }}>
                        Pilih Poliklinik & Dokter
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#526B62', fontSize: 12.5 }}>
                        Sesuaikan kebutuhan medis dengan jadwal dokter jaga rawat jalan hari ini
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* 4 Clinic Specialty Cards (2x2 Grid) */}
                <Grid container spacing={2} sx={{ mb: 2.5 }}>
                  {polis.map((poli) => {
                    const meta = POLI_METADATA[poli.kodePoli] || POLI_METADATA.UMU;
                    const IconComp = meta.icon;
                    const isSelected = Number(selectedPoliId) === Number(poli.id);
                    const countWait = queues.filter((q) => q.poliId === poli.id && q.status === 'MENUNGGU').length;
                    const estMins = Math.max(meta.estMinsPerQueue || 10, countWait * (meta.estMinsPerQueue || 10));

                    return (
                      <Grid key={poli.id} size={{ xs: 12, sm: 6 }}>
                        <Box
                          onClick={() => setSelectedPoliId(poli.id)}
                          sx={{
                            position: 'relative',
                            p: 2.2,
                            borderRadius: 2.5,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            bgcolor: isSelected ? '#F0F7F4' : '#FFFFFF',
                            border: '1.5px solid',
                            borderColor: isSelected ? '#1B4D3E' : '#D1DED8',
                            boxShadow: isSelected ? '0 4px 14px -2px rgba(27, 77, 62, 0.12)' : 'none',
                            '&:hover': { borderColor: '#1B4D3E', bgcolor: '#F8FAF9' },
                          }}
                        >
                          {isSelected && (
                            <Box sx={{ position: 'absolute', top: 12, right: 12, color: '#136B53' }}>
                              <CheckCircleIcon sx={{ fontSize: 20 }} />
                            </Box>
                          )}
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: 2,
                              bgcolor: isSelected ? '#1B4D3E' : '#E8F2EE',
                              color: isSelected ? '#FFFFFF' : '#1B4D3E',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mb: 1.5,
                            }}
                          >
                            <IconComp sx={{ fontSize: 22 }} />
                          </Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 15, mb: 0.5 }}>
                            {poli.namaPoli}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#526B62', fontSize: 12, mb: 1.8, minHeight: 34 }}>
                            {meta.sub}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px dashed #D1DED8', fontSize: 11.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#136B53', fontWeight: 700 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#136B53' }} />
                              {countWait} Antrean Menunggu
                            </Box>
                            <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600 }}>
                              Est: ~{estMins} mnt
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>

                {/* Active Assigned Doctor Card Detail */}
                {selectedDoctor && (
                  <Box
                    sx={{
                      p: 2.2,
                      borderRadius: 2.5,
                      bgcolor: '#F8FAF9',
                      border: '1px solid #D1DED8',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: '50%',
                          bgcolor: '#E8F2EE',
                          border: '2px solid #1B4D3E',
                          color: '#1B4D3E',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 18,
                          flexShrink: 0,
                        }}
                      >
                        {selectedDoctor.nama.replace('dr. ', '').replace('drg. ', '').slice(0, 2).toUpperCase()}
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 15.5 }}>
                            {selectedDoctor.nama}
                          </Typography>
                          <Chip label="Praktek Aktif" size="small" sx={{ bgcolor: '#136B53', color: '#FFFFFF', fontWeight: 700, fontSize: 10.5, height: 22 }} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#526B62', fontSize: 12.5, mt: 0.3, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <MeetingRoomOutlinedIcon sx={{ fontSize: 16, color: '#136B53' }} />
                            {metaPoli.room}
                          </Box>
                          <span>•</span>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ScheduleOutlinedIcon sx={{ fontSize: 16, color: '#136B53' }} />
                            {metaPoli.shift}
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* Switch Doctor dropdown if multiple doctors available */}
                    {activePoliDoctors.length > 1 && (
                      <FormControl size="small" sx={{ minWidth: 170 }}>
                        <Select
                          value={selectedDoctorId}
                          onChange={(e) => setSelectedDoctorId(e.target.value)}
                          sx={{ borderRadius: 2, fontSize: 12.5, bgcolor: '#FFFFFF' }}
                        >
                          {activePoliDoctors.map((doc) => (
                            <MenuItem key={doc.id} value={doc.id} sx={{ fontSize: 13 }}>
                              {doc.nama}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* STEP 3: JENIS KUNJUNGAN & RINCIAN KELUHAN */}
            <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 12px -2px rgba(27, 77, 62, 0.05)' }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2, mb: 2.5, borderBottom: '1px solid #F0F5F2' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: '#1B4D3E',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 14,
                      }}
                    >
                      3
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 16 }}>
                        Jenis Kunjungan & Rincian Keluhan
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#526B62', fontSize: 12.5 }}>
                        Tentukan jalur administrasi dan keluhan awal untuk rekam medis pra-konsultasi
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Tipe Layanan Kunjungan (Radio Cards 2x2) */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#121E1A', mb: 1.2 }}>
                      Tipe Layanan Kunjungan
                    </Typography>
                    <Grid container spacing={1.5} sx={{ alignItems: 'stretch' }}>
                      {VISIT_TYPES.map((v) => {
                        const isChecked = visitType === v.id;
                        return (
                          <Grid key={v.id} size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                            <Box
                              onClick={() => setVisitType(v.id)}
                              sx={{
                                width: '100%',
                                height: '100%',
                                minHeight: 64,
                                p: 1.5,
                                px: 2,
                                borderRadius: 2,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                border: '1.5px solid',
                                borderColor: isChecked ? '#1B4D3E' : '#D1DED8',
                                bgcolor: isChecked ? '#F0F7F4' : '#FFFFFF',
                                transition: 'all 0.15s',
                                boxSizing: 'border-box',
                                '&:hover': { borderColor: '#1B4D3E', bgcolor: '#F8FAF9' },
                              }}
                            >
                              <Radio
                                checked={isChecked}
                                onChange={() => setVisitType(v.id)}
                                value={v.id}
                                size="small"
                                sx={{ color: '#1B4D3E', '&.Mui-checked': { color: '#1B4D3E' }, p: 0.5, flexShrink: 0 }}
                              />
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#121E1A', fontSize: 13 }}>
                                  {v.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#526B62', fontSize: 11.5, display: 'block' }}>
                                  {v.sub}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>

                  {/* Penjamin Pembayaran Kunjungan */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#121E1A', mb: 1.2 }}>
                      Penjamin Pembayaran Kunjungan
                    </Typography>
                    <Grid container spacing={1.5} sx={{ alignItems: 'stretch' }}>
                      {[
                        { id: 'BPJS', label: 'BPJS Kesehatan' },
                        { id: 'UMUM', label: 'Umum / Mandiri (Tunai/QRIS)' },
                        { id: 'ASURANSI', label: 'Asuransi Swasta' },
                      ].map((item) => {
                        const isChecked = penjamin === item.id;
                        return (
                          <Grid key={item.id} size={{ xs: 12, sm: 4 }} sx={{ display: 'flex' }}>
                            <Box
                              onClick={() => setPenjamin(item.id)}
                              sx={{
                                width: '100%',
                                height: '100%',
                                minHeight: 52,
                                p: 1.2,
                                px: 1.6,
                                borderRadius: 2,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                border: '1.5px solid',
                                borderColor: isChecked ? '#1B4D3E' : '#D1DED8',
                                bgcolor: isChecked ? '#E8F2EE' : '#FFFFFF',
                                transition: 'all 0.15s',
                                boxSizing: 'border-box',
                                '&:hover': { borderColor: '#1B4D3E' },
                              }}
                            >
                              <Radio
                                checked={isChecked}
                                onChange={() => setPenjamin(item.id)}
                                value={item.id}
                                size="small"
                                sx={{ color: '#136B53', '&.Mui-checked': { color: '#136B53' }, p: 0.3, flexShrink: 0 }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 700,
                                  color: isChecked ? '#1B4D3E' : '#121E1A',
                                  fontSize: 12.5,
                                  lineHeight: 1.3,
                                }}
                              >
                                {item.label}
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>

                  {/* Keluhan Utama Singkat */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#121E1A' }}>
                        Keluhan Utama Singkat (Catatan Perawat Triage)
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 600 }}>
                        Opsional
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={keluhanAwal}
                      onChange={(e) => setKeluhanAwal(e.target.value)}
                      placeholder="Contoh: Demam tinggi 3 hari berturut-turut, batuk kering berdahak, mual pada pagi hari..."
                      sx={{
                        bgcolor: '#FFFFFF',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          fontSize: 13.5,
                        },
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT COLUMN: 5 COLS (STICKY THERMAL TICKET PREVIEW & ACTION) */}
          <Grid size={{ xs: 12, lg: 5 }} sx={{ position: { lg: 'sticky' }, top: { lg: 84 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* PRATINJAU TIKET FISIK WRAPPER */}
            <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', overflow: 'hidden', boxShadow: '0 8px 30px -4px rgba(27, 77, 62, 0.1)' }}>
              {/* Header Dark Forest Green */}
              <Box sx={{ bgcolor: '#1B4D3E', color: '#FFFFFF', px: 2.5, py: 1.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: 0.5, fontSize: 15 }}>
                  PRATINJAU TIKET FISIK
                </Typography>
                <Chip
                  size="small"
                  label="Realtime"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.18)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 11,
                    height: 24,
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              </Box>

              {/* Realistic Thermal Paper Body */}
              <Box sx={{ p: 2.5, bgcolor: '#F8FAF9', display: 'flex', justifyContent: 'center' }}>
                <Box
                  id="printable-thermal-ticket"
                  sx={{
                    width: '100%',
                    maxWidth: 360,
                    bgcolor: '#FFFFFF',
                    p: 2.5,
                    borderRadius: 2.5,
                    border: '1px solid #D1DED8',
                    boxShadow: '0 4px 16px -2px rgba(27, 77, 62, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  {/* Clinic Logo & Brand Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <LocalHospitalOutlinedIcon sx={{ color: '#1B4D3E', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1B4D3E', letterSpacing: 1, fontSize: 16 }}>
                      KLINIK PRATAMA
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', fontSize: 10.5 }}>
                    Instalasi Rawat Jalan & Triage Medis
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#707974', fontSize: 10.5, mb: 1 }}>
                    Jl. Tebet Raya No. 45 • Telp: (021) 8370-1122
                  </Typography>

                  {/* Dashed separator */}
                  <Box sx={{ width: '100%', borderTop: '1.5px dashed #D1DED8', my: 1.2 }} />

                  {/* Queue Number Display */}
                  <Typography variant="caption" sx={{ color: '#526B62', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700, fontSize: 10.5 }}>
                    Nomor Antrean Anda
                  </Typography>
                  <Box
                    sx={{
                      my: 1,
                      py: 0.8,
                      px: 3,
                      borderRadius: 2,
                      bgcolor: '#F0F7F4',
                      border: '1px solid #D1DED8',
                    }}
                  >
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#1B4D3E', letterSpacing: -0.5, fontSize: '2.5rem' }}>
                      {previewQueueNumber}
                    </Typography>
                  </Box>

                  {/* Destination Details Box */}
                  <Box sx={{ width: '100%', bgcolor: '#F8FAF9', borderRadius: 2, p: 1.5, my: 1, textAlign: 'left', border: '1px solid #E5EDE9' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4, fontSize: 12 }}>
                      <span style={{ color: '#526B62' }}>Poliklinik Tujuan:</span>
                      <strong style={{ color: '#121E1A' }}>{selectedPoli?.namaPoli || 'Poli Umum'}</strong>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4, fontSize: 12 }}>
                      <span style={{ color: '#526B62' }}>Ruang Praktek:</span>
                      <span style={{ color: '#121E1A' }}>{metaPoli.room}</span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4, fontSize: 12 }}>
                      <span style={{ color: '#526B62' }}>Dokter Jaga:</span>
                      <span style={{ color: '#121E1A' }}>{selectedDoctor?.nama || '-'}</span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4, fontSize: 12 }}>
                      <span style={{ color: '#526B62' }}>Nama Pasien:</span>
                      <strong style={{ color: '#121E1A', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedPatient?.nama || '(Belum dipilih)'}
                      </strong>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4, fontSize: 12 }}>
                      <span style={{ color: '#526B62' }}>No. Rekam Medis:</span>
                      <strong style={{ color: '#136B53' }}>{selectedPatient?.noRm || '-'}</strong>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4, fontSize: 12 }}>
                      <span style={{ color: '#526B62' }}>Penjamin:</span>
                      <span style={{ color: '#121E1A' }}>{penjamin}</span>
                    </Box>
                  </Box>

                  {/* Preceding Queue Stats */}
                  <Grid container spacing={1} sx={{ width: '100%', my: 0.5 }}>
                    <Grid size={6}>
                      <Box sx={{ bgcolor: '#E8F2EE', p: 1, borderRadius: 1.8, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ display: 'block', color: '#136B53', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>
                          Antrean di Depan
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1B4D3E', fontSize: 15 }}>
                          {waitingCount} Pasien
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={6}>
                      <Box sx={{ bgcolor: '#F0F5F2', p: 1, borderRadius: 1.8, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ display: 'block', color: '#526B62', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>
                          Estimasi Dilayani
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 15 }}>
                          {estimatedServeTime}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Dynamic QR Code Mockup */}
                  <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E5EDE9', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ width: 84, height: 84, p: 0.5, bgcolor: '#F8FAF9', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="74" height="74" viewBox="0 0 100 100" fill="#1B4D3E">
                        <path d="M0 0h36v36H0V0zm8 8v20h20V8H8zm56-8h36v36H64V0zm8 8v20h20V8H72zM0 64h36v36H0V64zm8 8v20h20V72H8zm44-52h8v8h-8v-8zm8 8h8v8h-8v-8zm-8 8h8v8h-8v-8zm16 0h8v8h-8v-8zm8-8h8v8h-8v-8zm0 16h8v8h-8v-8zm-24 8h8v8h-8v-8zm8 8h8v8h-8v-8zm8-8h8v8h-8v-8zm8 8h8v8h-8v-8zm-16 16h8v8h-8v-8zm8 8h8v8h-8v-8zm16-8h8v8h-8v-8zm8 8h8v8h-8v-8z" />
                      </svg>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#526B62', fontSize: 10.5, mt: 0.8, fontWeight: 600 }}>
                      Scan QR untuk Pantau Antrean via HP
                    </Typography>
                  </Box>

                  {/* Timestamp & Footer Quote */}
                  <Typography variant="caption" sx={{ color: '#707974', fontSize: 10.5, mt: 1.5 }}>
                    Dicetak: {currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {String(currentTime.getHours()).padStart(2, '0')}:{String(currentTime.getMinutes()).padStart(2, '0')} WIB • Loket 01
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#88928D', fontStyle: 'italic', fontSize: 10, mt: 0.5 }}>
                    &quot;Semoga lekas sembuh. Harap menunggu panggilan di ruang tunggu Poli.&quot;
                  </Typography>
                </Box>
              </Box>

              {/* Output & Notification Preferences */}
              <Box sx={{ px: 3, pt: 2, pb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#121E1A', mb: 1 }}>
                  Distribusi Tiket & Notifikasi
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box
                    onClick={() => setPrintThermal(!printThermal)}
                    sx={{
                      p: 1.2,
                      px: 1.5,
                      borderRadius: 1.8,
                      bgcolor: '#F8FAF9',
                      border: '1px solid #D1DED8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <PrintOutlinedIcon sx={{ color: '#1B4D3E', fontSize: 19 }} />
                      <Typography variant="body2" sx={{ color: '#121E1A', fontSize: 13 }}>
                        Cetak Tiket Fisik (Thermal Roll)
                      </Typography>
                    </Box>
                    <Checkbox checked={printThermal} size="small" sx={{ color: '#1B4D3E', '&.Mui-checked': { color: '#1B4D3E' }, p: 0 }} />
                  </Box>

                  <Box
                    onClick={() => setSendWhatsApp(!sendWhatsApp)}
                    sx={{
                      p: 1.2,
                      px: 1.5,
                      borderRadius: 1.8,
                      bgcolor: '#F8FAF9',
                      border: '1px solid #D1DED8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <ChatOutlinedIcon sx={{ color: '#136B53', fontSize: 19 }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: '#121E1A', fontSize: 13 }}>
                          Kirim E-Tiket via WhatsApp
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#136B53', fontSize: 11 }}>
                          {selectedPatient?.noTelp || '(Belum ada No. HP)'}
                        </Typography>
                      </Box>
                    </Box>
                    <Checkbox checked={sendWhatsApp} size="small" sx={{ color: '#136B53', '&.Mui-checked': { color: '#136B53' }, p: 0 }} />
                  </Box>

                  <Box
                    onClick={() => setSendSms(!sendSms)}
                    sx={{
                      p: 1.2,
                      px: 1.5,
                      borderRadius: 1.8,
                      bgcolor: '#F8FAF9',
                      border: '1px solid #D1DED8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      opacity: 0.7,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <SmsOutlinedIcon sx={{ color: '#526B62', fontSize: 19 }} />
                      <Typography variant="body2" sx={{ color: '#526B62', fontSize: 13 }}>
                        Kirim SMS Gateway Notifikasi
                      </Typography>
                    </Box>
                    <Checkbox checked={sendSms} size="small" sx={{ color: '#526B62', '&.Mui-checked': { color: '#1B4D3E' }, p: 0 }} />
                  </Box>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ p: 3, pt: 1.5, bgcolor: '#F0F5F2' }}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={submitting || !selectedPatient}
                  onClick={handleSubmitQueue}
                  startIcon={submitting ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : <PrintOutlinedIcon sx={{ fontSize: 20 }} />}
                  sx={{
                    bgcolor: '#1B4D3E',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: 14.5,
                    py: 1.4,
                    borderRadius: 2.2,
                    boxShadow: '0 4px 14px -2px rgba(27, 77, 62, 0.3)',
                    '&:hover': { bgcolor: '#133D31' },
                    '&.Mui-disabled': { bgcolor: '#A0B4AC', color: '#FFFFFF' },
                  }}
                >
                  {submitting ? 'Menerbitkan Antrean...' : 'Konfirmasi & Cetak Antrean (Enter)'}
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
                  <Button
                    size="small"
                    onClick={handleResetForm}
                    sx={{ color: '#526B62', fontSize: 12, fontWeight: 600, '&:hover': { color: '#BA1A1A' } }}
                  >
                    Reset Formulir
                  </Button>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#526B62', fontSize: 12 }}>
                    <LockOutlinedIcon sx={{ fontSize: 14 }} />
                    Data Terenkripsi SSL
                  </Box>
                </Box>
              </Box>
            </Card>

            {/* Mini Stats Banner */}
            <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 2.5, border: '1px solid #D1DED8', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: '#E8F2EE',
                      color: '#136B53',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TimerOutlinedIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#526B62', fontWeight: 700, textTransform: 'uppercase', fontSize: 10.5 }}>
                      Rerata Pelayanan Poli Hari Ini
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 14 }}>
                      11 Menit / Pasien
                    </Typography>
                  </Box>
                </Box>
                <Button
                  size="small"
                  onClick={() => setActiveTab('daftar')}
                  endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                  sx={{ color: '#136B53', fontWeight: 700, fontSize: 12 }}
                >
                  Monitor TV
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      ) : (
        /* 3. Content: Daftar Antrean & Registrasi Hari Ini (Tabel Manajemen) */
        <Card sx={{ bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #D1DED8', boxShadow: '0 2px 12px -2px rgba(27, 77, 62, 0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#121E1A' }}>
                  Daftar Pendaftaran & Antrean Aktif
                </Typography>
                <Typography variant="body2" sx={{ color: '#526B62', fontSize: 13 }}>
                  Pantau status antrean pasien di setiap poliklinik secara live
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    displayEmpty
                    sx={{ borderRadius: 2, fontSize: 13 }}
                  >
                    <MenuItem value="">Semua Status</MenuItem>
                    <MenuItem value="MENUNGGU">Menunggu</MenuItem>
                    <MenuItem value="CHECK_IN">Check In</MenuItem>
                    <MenuItem value="PEMERIKSAAN">Pemeriksaan</MenuItem>
                    <MenuItem value="SELESAI">Selesai</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={fetchAllData}
                  startIcon={<RefreshIcon sx={{ fontSize: 18 }} />}
                  sx={{ borderColor: '#D1DED8', color: '#1B4D3E', fontWeight: 700, borderRadius: 2, py: 0.8 }}
                >
                  Segarkan Data
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setActiveTab('baru')}
                  startIcon={<AddCircleOutlinedIcon sx={{ fontSize: 18 }} />}
                  sx={{ bgcolor: '#1B4D3E', color: '#FFFFFF', fontWeight: 700, borderRadius: 2, py: 0.8 }}
                >
                  Ambil Antrean
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #D1DED8', borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: '#F0F5F2' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#121E1A', fontSize: 12.5 }}>No. Antrean</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#121E1A', fontSize: 12.5 }}>No. Registrasi</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#121E1A', fontSize: 12.5 }}>Pasien</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#121E1A', fontSize: 12.5 }}>Poliklinik</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#121E1A', fontSize: 12.5 }}>Dokter</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#121E1A', fontSize: 12.5 }}>Penjamin</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#121E1A', fontSize: 12.5 }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 12.5 }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingData ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={24} sx={{ color: '#1B4D3E', mb: 1 }} />
                        <Typography variant="body2" sx={{ color: '#526B62' }}>Memuat daftar antrean...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" sx={{ color: '#526B62' }}>Belum ada antrean terdaftar hari ini</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistrations.map((r) => (
                      <TableRow key={r.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 900, color: '#1B4D3E', fontSize: 14 }}>
                            {r.queue?.nomorAntrean || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: 12.5, color: '#526B62' }}>{r.noRegistrasi}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#121E1A', fontSize: 13 }}>
                            {r.patient?.nama}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#526B62', fontSize: 11.5 }}>
                            RM: {r.patient?.noRm}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{r.poli?.namaPoli}</TableCell>
                        <TableCell sx={{ fontSize: 13, color: '#526B62' }}>{r.doctor?.nama}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={r.jenisPembayaran}
                            sx={{
                              bgcolor: r.jenisPembayaran === 'BPJS' ? '#E8F2EE' : '#F0F5F2',
                              color: r.jenisPembayaran === 'BPJS' ? '#136B53' : '#121E1A',
                              fontWeight: 700,
                              fontSize: 11,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={STATUS_LABEL[r.status] || r.status}
                            color={STATUS_COLOR[r.status] || 'default'}
                            sx={{ fontWeight: 700, fontSize: 11 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            {isPetugas && r.status === 'MENUNGGU' && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleCheckIn(r)}
                                disabled={actionLoadingId === r.id}
                                sx={{ borderColor: '#1B4D3E', color: '#1B4D3E', fontWeight: 700, fontSize: 11 }}
                              >
                                Check In
                              </Button>
                            )}
                            {isDokter && r.status === 'CHECK_IN' && r.queue?.status === 'MENUNGGU' && (
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleCall(r)}
                                disabled={actionLoadingId === r.id}
                                sx={{ bgcolor: '#1B4D3E', color: '#FFFFFF', fontWeight: 700, fontSize: 11 }}
                              >
                                Panggil
                              </Button>
                            )}
                            {isPetugas && r.status === 'PEMERIKSAAN' && (
                              <Button
                                size="small"
                                color="success"
                                variant="contained"
                                onClick={() => handleFinish(r)}
                                disabled={actionLoadingId === r.id}
                                sx={{ fontWeight: 700, fontSize: 11 }}
                              >
                                Selesaikan
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* 4. Dialog Success Ticket Issuance & Thermal Print */}
      <Dialog open={ticketModalOpen} onClose={() => setTicketModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1B4D3E', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
          <CheckCircleIcon sx={{ color: '#A0F0D1' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Antrean Berhasil Diterbitkan!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAF9' }}>
          {issuedTicket && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#526B62', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>
                Nomor Antrean
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 900, color: '#1B4D3E', my: 1, letterSpacing: -0.5 }}>
                {issuedTicket.nomorAntrean}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#121E1A' }}>
                {issuedTicket.poliNama}
              </Typography>
              <Typography variant="body2" sx={{ color: '#526B62', mb: 2 }}>
                Dokter: {issuedTicket.dokterNama}
              </Typography>

              <Box sx={{ width: '100%', bgcolor: '#FFFFFF', p: 2, borderRadius: 2, border: '1px solid #D1DED8', textAlign: 'left', mb: 2, fontSize: 12.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}>
                  <span style={{ color: '#526B62' }}>Pasien:</span>
                  <strong style={{ color: '#121E1A' }}>{issuedTicket.pasienNama}</strong>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}>
                  <span style={{ color: '#526B62' }}>No. RM:</span>
                  <span style={{ color: '#136B53', fontWeight: 700 }}>{issuedTicket.pasienNoRm}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}>
                  <span style={{ color: '#526B62' }}>Penjamin:</span>
                  <span style={{ color: '#121E1A' }}>{issuedTicket.penjamin}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}>
                  <span style={{ color: '#526B62' }}>Estimasi Dilayani:</span>
                  <strong style={{ color: '#1B4D3E' }}>{issuedTicket.estimasiWaktu}</strong>
                </Box>
              </Box>

              {sendWhatsApp && (
                <Alert severity="success" icon={<ChatOutlinedIcon sx={{ color: '#136B53' }} />} sx={{ width: '100%', fontSize: 12, mb: 1, textAlign: 'left' }}>
                  E-Tiket dan link pelacakan berhasil dikirim ke WhatsApp <strong>{issuedTicket.noHp || '-'}</strong>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: '#FFFFFF', display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setTicketModalOpen(false);
              handleResetForm();
            }}
            sx={{ borderColor: '#D1DED8', color: '#526B62', fontWeight: 700, borderRadius: 2 }}
          >
            Selesai
          </Button>
          <Button
            variant="contained"
            onClick={handlePrintAction}
            startIcon={<PrintOutlinedIcon />}
            sx={{ bgcolor: '#1B4D3E', color: '#FFFFFF', fontWeight: 800, borderRadius: 2, '&:hover': { bgcolor: '#133D31' } }}
          >
            Cetak Tiket
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2, fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}