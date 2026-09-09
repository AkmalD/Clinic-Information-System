import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';
import { getDashboardSummary } from '../../api/dashboard.api';

const CARD_CONFIG = [
  { key: 'totalPasien', label: 'Total Pasien' },
  { key: 'totalPasienHariIni', label: 'Pasien Hari Ini' },
  { key: 'totalAntreanHariIni', label: 'Antrean Hari Ini' },
  { key: 'totalPasienMenunggu', label: 'Pasien Menunggu' },
  { key: 'totalPasienSelesaiDilayani', label: 'Selesai Dilayani' },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary().then((res) => setSummary(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>Dashboard</Typography>
      <Grid container spacing={2}>
        {CARD_CONFIG.map((card) => (
          <Grid key={card.key} size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                <Typography variant="h4" fontWeight={700}>{summary?.[card.key] ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}