import { useEffect, useState } from 'react';
import {
  Grid, Card, CardContent, Typography, CircularProgress, Box,
  Button, Chip, Avatar,
} from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DateRangeIcon from '@mui/icons-material/DateRange';
import InsightsIcon from '@mui/icons-material/Insights';
import { getDashboardSummary } from '../../api/dashboard.api';
import { useAuth } from '../../context/AuthContext';

// Helper SVG Area Chart (Clinical Forest Theme)
function AreaChart({ data }) {
  if (!data || data.length === 0) return null;

  const width = 540;
  const height = 160;
  const paddingX = 30;
  const paddingTop = 20;
  const paddingBottom = 20;

  const counts = data.map((d) => d.count);
  const maxVal = Math.max(...counts, 30);
  const minVal = 0;

  const points = data.map((d, i) => {
    const x = paddingX + (i * (width - 2 * paddingX)) / (data.length - 1);
    const y = height - paddingBottom - ((d.count - minVal) / (maxVal - minVal)) * (height - paddingTop - paddingBottom);
    return { x, y, count: d.count, label: d.label };
  });

  // Generate cubic Bezier path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p0.x + (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', py: 1 }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="primaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#136B53" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#136B53" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Clean horizontal reference lines */}
        {[0.25, 0.5, 0.75].map((ratio) => {
          const y = paddingTop + ratio * (height - paddingTop - paddingBottom);
          return (
            <line
              key={ratio}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke="#DDEBE5"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#primaryAreaGrad)" />

        {/* Smooth spline stroke */}
        <path d={pathD} fill="none" stroke="#136B53" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Coordinate Points */}
        {points.map((p, idx) => {
          const isToday = idx === points.length - 1;
          return (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isToday ? 6 : 4}
                fill={isToday ? '#003629' : '#FFFFFF'}
                stroke={isToday ? '#BAEED9' : '#136B53'}
                strokeWidth={isToday ? 3 : 2.5}
              />
            </g>
          );
        })}
      </svg>

      {/* Day Labels */}
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${data.length}, 1fr)`, textAlign: 'center', pt: 1.5 }}>
        {data.map((item, idx) => {
          const isToday = idx === data.length - 1 || item.label === 'Hari Ini';
          return (
            <Typography
              key={idx}
              variant="caption"
              sx={{
                fontWeight: isToday ? 800 : 600,
                fontSize: 11.5,
                color: isToday ? '#136B53' : '#526B62',
              }}
            >
              {item.label} ({item.count})
            </Typography>
          );
        })}
      </Box>
    </Box>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('bulan');
  const [chartGranularity, setChartGranularity] = useState('mingguan');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Jam real-time (ticking clock)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getDashboardSummary()
      .then((res) => setSummary(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#1B4D3E' }} />
      </Box>
    );
  }

  // Format tanggal & jam
  const todayDateStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(currentTime);

  const timeStr = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(currentTime) + ' WIB';

  const monthShort = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(currentTime);

  // Label rentang aktif & subtext chart dinamis
  let activePeriodLabel = `1 - ${currentTime.getDate()} ${monthShort} ${currentTime.getFullYear()}`;
  let chartSubtext = 'Distribusi volume pasien aktif mingguan';
  if (period === 'hari') {
    activePeriodLabel = `${currentTime.getDate()} ${monthShort} ${currentTime.getFullYear()}`;
    chartSubtext = 'Distribusi volume pasien per jam hari ini';
  } else if (period === 'tahun') {
    activePeriodLabel = `Tahun ${currentTime.getFullYear()} (Jan - ${monthShort})`;
    chartSubtext = `Distribusi volume pasien bulanan tahun ${currentTime.getFullYear()}`;
  }

  // Fallback dokter 4 poliklinik klinik jika database belum terisi lengkap
  const defaultDoctors = [
    { id: 1, nama: 'dr. Andi Wijaya', poli: 'Poli Umum', ruang: 'Ruang 1', initials: 'AW', status: 'Aktif (1 antrean)' },
    { id: 2, nama: 'drg. Siti Aminah', poli: 'Poli Gigi', ruang: 'Ruang 2', initials: 'SA', status: 'Aktif (2 antrean)' },
    { id: 3, nama: 'dr. Sarah Melati, Sp.A', poli: 'Poli Anak', ruang: 'Ruang 3', initials: 'SM', status: 'Siap Layani' },
    { id: 4, nama: 'dr. Ratna Dewi, Sp.OG', poli: 'Poli KIA', ruang: 'Ruang 4', initials: 'RD', status: 'Mulai 15:00' },
  ];

  const doctorsList = summary?.jadwalDokter && summary.jadwalDokter.length > 0
    ? summary.jadwalDokter
    : defaultDoctors;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', pb: 4 }}>
      {/* 1. Header & Live Clock Banner */}
      <Box sx={{ pb: 2.5, borderBottom: '1px solid #DDEBE5' }}>
        {/* Date & Live Time Badges */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: '#404945', fontSize: 13, fontWeight: 600 }}>
            <CalendarMonthOutlinedIcon sx={{ fontSize: 16, color: '#136B53' }} />
            {todayDateStr}
          </Box>
          <Typography variant="caption" sx={{ color: '#C0C9C3' }}>•</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: '#404945', fontSize: 13, fontWeight: 700 }}>
            <ScheduleIcon sx={{ fontSize: 16, color: '#136B53' }} />
            {timeStr}
          </Box>
        </Box>

        {/* Welcome Title */}
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#003629', letterSpacing: -0.5, fontSize: { xs: '1.75rem', md: '2.1rem' } }}>
          Selamat Datang kembali,{' '}
          <Box component="span" sx={{ color: '#136B53' }}>
            {user?.namaLengkap || 'Administrator'}
          </Box>
        </Typography>
        <Typography variant="body1" sx={{ color: '#404945', mt: 0.5, fontSize: 14 }}>
          Pantau ringkasan pelayanan klinik, arus kunjungan, dan ketersediaan dokter secara terpadu.
        </Typography>
      </Box>

      {/* 2. Period Filter Controls */}
      <Box sx={{ pt: 2.5, pb: 1.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" sx={{ color: '#404945', fontWeight: 600, fontSize: 13 }}>
            Rentang Waktu:
          </Typography>
          <Box sx={{ bgcolor: '#FFFFFF', p: 0.5, borderRadius: 3, display: 'flex', gap: 0.5, border: '1px solid #DDEBE5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            {[
              { key: 'hari', label: 'Hari Ini' },
              { key: 'bulan', label: 'Bulan Ini' },
              { key: 'tahun', label: 'Tahun Ini' },
            ].map((p) => {
              const isSelected = period === p.key;
              return (
                <Button
                  key={p.key}
                  size="small"
                  onClick={() => setPeriod(p.key)}
                  sx={{
                    px: 2,
                    py: 0.6,
                    borderRadius: 2,
                    fontSize: 12.5,
                    fontWeight: isSelected ? 700 : 500,
                    bgcolor: isSelected ? '#136B53' : 'transparent',
                    color: isSelected ? '#FFFFFF' : '#404945',
                    boxShadow: isSelected ? '0 1px 3px rgba(19, 107, 83, 0.2)' : 'none',
                    '&:hover': {
                      bgcolor: isSelected ? '#0F5128' : '#F4F8F6',
                      color: isSelected ? '#FFFFFF' : '#003629',
                    },
                  }}
                >
                  {p.label}
                </Button>
              );
            })}
          </Box>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<DateRangeIcon sx={{ color: '#136B53', fontSize: 18 }} />}
          endIcon={<KeyboardArrowDownIcon sx={{ color: '#707974', fontSize: 16 }} />}
          sx={{
            bgcolor: '#FFFFFF',
            borderColor: '#DDEBE5',
            color: '#003629',
            fontWeight: 700,
            fontSize: 12.5,
            borderRadius: 2.5,
            py: 0.8,
            px: 2,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            '&:hover': { borderColor: '#136B53' },
          }}
        >
          {activePeriodLabel}
        </Button>
      </Box>

      {/* 3. Streamlined 4 Essential Metric Cards */}
      <Grid container spacing={2.5} sx={{ pt: 1, mb: 3 }}>
        {/* KPI Card 1: Total Pasien Terdaftar */}
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid #DDEBE5', borderRadius: 4, p: 1, bgcolor: '#FFFFFF', boxShadow: '0 2px 12px -2px rgba(27,77,62,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#404945', fontSize: 13 }}>
                  Total Pasien Terdaftar
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: 2.5, bgcolor: '#E9F7F0', color: '#136B53', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#003629', letterSpacing: -0.5, fontSize: '2rem' }}>
                  {Number(summary?.totalPasien || 0).toLocaleString('id-ID')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#404945', fontWeight: 600 }}>
                  rekam medis
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 1.5, color: '#136B53', fontWeight: 700, fontSize: 11.5 }}>
                <TrendingUpIcon sx={{ fontSize: 16 }} />
                <span>+{summary?.totalPasienHariIni || 0} pasien baru</span>
                <Typography component="span" sx={{ color: '#404945', fontWeight: 400, fontSize: 11.5 }}>
                  periode ini
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI Card 2: Kunjungan Periode Ini */}
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid #DDEBE5', borderRadius: 4, p: 1, bgcolor: '#FFFFFF', boxShadow: '0 2px 12px -2px rgba(27,77,62,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#404945', fontSize: 13 }}>
                  Kunjungan Periode Ini
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: 2.5, bgcolor: '#A0F0D1', color: '#136B53', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarMonthOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#003629', letterSpacing: -0.5, fontSize: '2rem' }}>
                  {summary?.totalKunjunganPeriode || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: '#404945', fontWeight: 600 }}>
                  kunjungan
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 1.5, color: '#136B53', fontWeight: 700, fontSize: 11.5 }}>
                <InsightsIcon sx={{ fontSize: 16 }} />
                <span>Rata-rata {Math.max(Math.round((summary?.totalKunjunganPeriode || 0) / Math.max(currentTime.getDate(), 1)), 1)} pasien</span>
                <Typography component="span" sx={{ color: '#404945', fontWeight: 400, fontSize: 11.5 }}>
                  / hari
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI Card 3: Antrean Aktif Menunggu */}
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid #DDEBE5', borderRadius: 4, p: 1, bgcolor: '#FFFFFF', boxShadow: '0 2px 12px -2px rgba(27,77,62,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#404945', fontSize: 13 }}>
                  Antrean Aktif Menunggu
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: 2.5, bgcolor: '#BAEED9', color: '#003629', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HourglassEmptyOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#003629', letterSpacing: -0.5, fontSize: '2rem' }}>
                  {summary?.totalAntreanAktif || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: '#404945', fontWeight: 600 }}>
                  di ruang tunggu poli
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 1.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#136B53' }} />
                <Typography variant="caption" sx={{ color: '#404945', fontSize: 11.5 }}>
                  Waktu tunggu: <strong style={{ color: '#121E1A' }}>~{Math.max((summary?.totalAntreanAktif || 0) * 10, 5)} menit</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI Card 4: Pelayanan Selesai */}
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid #DDEBE5', borderRadius: 4, p: 1, bgcolor: '#FFFFFF', boxShadow: '0 2px 12px -2px rgba(27,77,62,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#404945', fontSize: 13 }}>
                  Pelayanan Selesai
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: 2.5, bgcolor: '#E9F7F0', color: '#136B53', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#003629', letterSpacing: -0.5, fontSize: '2rem' }}>
                  {summary?.totalPasienSelesaiDilayani || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: '#404945', fontWeight: 600 }}>
                  pasien terlayani
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 1.5, color: '#136B53', fontWeight: 700, fontSize: 11.5 }}>
                <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Tingkat Kepuasan 98%</span>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 4. Spacious Main Section: Trend Chart (7 cols) & Doctors / Pharmacy (5 cols) */}
      <Grid container spacing={3}>
        {/* LEFT: Tren Kunjungan Pasien */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card elevation={0} sx={{ border: '1px solid #DDEBE5', borderRadius: 4, p: 1, bgcolor: '#FFFFFF', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 12px -2px rgba(27,77,62,0.05)' }}>
            <CardContent>
              {/* Header Widget */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, pb: 2, borderBottom: '1px solid #DDEBE5' }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: '#E9F7F0', color: '#136B53', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShowChartIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#003629', fontSize: 16 }}>
                      Tren Kunjungan Pasien
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#404945', fontSize: 12 }}>
                      {chartSubtext}
                    </Typography>
                  </Box>
                </Box>

                {/* Granularity Toggle */}
                <Box sx={{ bgcolor: '#E9F7F0', p: 0.4, borderRadius: 2, display: 'flex' }}>
                  {['harian', 'mingguan', 'bulanan'].map((view) => {
                    const label = view.charAt(0).toUpperCase() + view.slice(1);
                    const active = chartGranularity === view;
                    return (
                      <Button
                        key={view}
                        size="small"
                        onClick={() => setChartGranularity(view)}
                        sx={{
                          px: 1.5,
                          py: 0.3,
                          fontSize: 11,
                          fontWeight: active ? 700 : 500,
                          borderRadius: 1.5,
                          bgcolor: active ? '#FFFFFF' : 'transparent',
                          color: active ? '#003629' : '#404945',
                          boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                        }}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </Box>
              </Box>

              {/* Area Chart Component */}
              <Box sx={{ pt: 3, pb: 1 }}>
                <AreaChart data={summary?.weeklyTrend || []} />
              </Box>
            </CardContent>

            {/* Bottom Clean Operational Highlight (Tanpa keterangan footer eksternal) */}
            <Box
              sx={{
                px: 3,
                py: 2,
                borderTop: '1px solid #DDEBE5',
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#136B53' }} />
              <Typography variant="caption" sx={{ fontWeight: 500, color: '#404945', fontSize: 12.5 }}>
                Puncak kunjungan tertinggi tercatat pada hari <strong>{summary?.peakDay?.label || 'Sabtu'} ({summary?.peakDay?.count || 0} pasien)</strong>
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* RIGHT: Jadwal Praktik Dokter & Notifikasi Logistik Farmasi */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Card: Jadwal Praktik Dokter */}
            <Card elevation={0} sx={{ border: '1px solid #DDEBE5', borderRadius: 4, p: 1, bgcolor: '#FFFFFF', boxShadow: '0 2px 12px -2px rgba(27,77,62,0.05)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.8, borderBottom: '1px solid #DDEBE5' }}>
                  <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2.5, bgcolor: '#A0F0D1', color: '#136B53', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LocalHospitalIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#003629', fontSize: 14 }}>
                        Jadwal Praktik Dokter
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#404945', fontSize: 11.5 }}>
                        Shift Aktif Hari Ini
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={`${doctorsList.length} Dokter Jaga`}
                    size="small"
                    sx={{ bgcolor: '#A0F0D1', color: '#003629', fontWeight: 700, fontSize: 11, borderRadius: 50 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', divideY: '1px solid #DDEBE5', mt: 0.5 }}>
                  {doctorsList.map((doc, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1.5,
                        px: 0.5,
                        borderBottom: idx < doctorsList.length - 1 ? '1px solid #DDEBE5' : 'none',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar sx={{ width: 38, height: 38, bgcolor: '#E9F7F0', color: '#003629', fontWeight: 700, fontSize: 13 }}>
                            {doc.initials}
                          </Avatar>
                          <Box
                            sx={{
                              width: 9,
                              height: 9,
                              borderRadius: '50%',
                              bgcolor: doc.status.includes('Mulai') ? '#707974' : '#136B53',
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              border: '1.5px solid #FFFFFF',
                            }}
                          />
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#121E1A', fontSize: 13, lineHeight: 1.2 }}>
                            {doc.nama}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#404945', fontSize: 11.5 }}>
                            {doc.poli} • {doc.ruang}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: 'right' }}>
                        <Chip
                          label={doc.status.includes('Aktif') ? 'Aktif' : doc.status}
                          size="small"
                          sx={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            borderRadius: 1.5,
                            bgcolor: doc.status.includes('Mulai')
                              ? '#E3F1EA'
                              : doc.status.includes('Siap')
                              ? '#E3F1EA'
                              : '#A0F0D1',
                            color: doc.status.includes('Mulai')
                              ? '#707974'
                              : doc.status.includes('Siap')
                              ? '#003629'
                              : '#136B53',
                          }}
                        />
                        {doc.status.includes('Aktif') && (
                          <Typography variant="caption" sx={{ display: 'block', fontSize: 10.5, color: '#404945', mt: 0.3 }}>
                            {doc.antreanAktif || 0} antrean
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Card: Notifikasi Logistik Farmasi (Compact Operational Notice Card) */}
            <Card
              elevation={0}
              sx={{
                border: '1px solid #DDEBE5',
                borderRadius: 4,
                p: 2,
                bgcolor: '#FFFFFF',
                boxShadow: '0 2px 12px -2px rgba(27,77,62,0.05)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  bgcolor: '#FEF3C7',
                  color: '#B45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shrink: 0,
                  mt: 0.2,
                }}
              >
                <Inventory2OutlinedIcon sx={{ fontSize: 19 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#121E1A', fontSize: 13 }}>
                    Notifikasi Logistik Farmasi
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#B45309', fontWeight: 700, fontSize: 11 }}>
                    {summary?.notifikasiFarmasi?.status || 'Perhatian'}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#404945', fontSize: 11.5, lineHeight: 1.4, display: 'block', mt: 0.3 }}>
                  {summary?.notifikasiFarmasi?.pesan || 'Stok Amoxicillin 500mg tersisa 18 strip. Re-stock otomatis telah diajukan ke Gudang Farmasi Utama.'}
                </Typography>
              </Box>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}