import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  Paper, TableContainer, Chip, Snackbar, Alert, TextField, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../context/AuthContext';
import { getRegistrations, createRegistration, updateRegistration } from '../../api/registrations.api';
import { createQueue, callQueue } from '../../api/queues.api';
import RegistrationFormDialog from './RegistrationFormDialog';

const STATUS_COLOR = { MENUNGGU: 'default', CHECK_IN: 'info', PEMERIKSAAN: 'primary', SELESAI: 'success' };
const STATUS_LABEL = { MENUNGGU: 'Menunggu', CHECK_IN: 'Check In', PEMERIKSAAN: 'Pemeriksaan', SELESAI: 'Selesai' };

export default function RegistrationsPage() {
  const { user } = useAuth();
  const isPetugas = user?.role === 'PETUGAS';
  const isDokter = user?.role === 'DOKTER';

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = useCallback(() => {
    setLoading(true);
    getRegistrations({ status: statusFilter || undefined })
      .then((res) => setRegistrations(res.data))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const handleCreateRegistration = async (data) => {
    try {
      const regRes = await createRegistration(data);
      await createQueue(regRes.data.id); // langsung generate nomor antrean, 1 aksi user = 2 API call
      setFormOpen(false);
      showSnackbar('Pendaftaran & nomor antrean berhasil dibuat');
      fetchData();
    } catch (err) {
      setFormError(err?.message || 'Gagal membuat pendaftaran');
    }
  };

  const handleCheckIn = async (registration) => {
    setActionLoadingId(registration.id);
    try {
      await updateRegistration(registration.id, { status: 'CHECK_IN' });
      showSnackbar(`${registration.patient.nama} berhasil check-in`);
      fetchData();
    } catch (err) {
      showSnackbar(err?.message || 'Gagal check-in', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCall = async (registration) => {
    setActionLoadingId(registration.id);
    try {
      await callQueue(registration.queue.id);
      showSnackbar(`Antrean ${registration.queue.nomorAntrean} berhasil dipanggil`);
      fetchData();
    } catch (err) {
      showSnackbar(err?.message || 'Gagal memanggil antrean', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Pendaftaran & Antrean</Typography>
        {isPetugas && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setFormError(''); setFormOpen(true); }}>
            Tambah Pendaftaran
          </Button>
        )}
      </Box>

      <TextField select size="small" label="Filter Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ mb: 2, width: 220 }}>
        <MenuItem value="">Semua Status</MenuItem>
        <MenuItem value="MENUNGGU">Menunggu</MenuItem>
        <MenuItem value="CHECK_IN">Check In</MenuItem>
        <MenuItem value="PEMERIKSAAN">Pemeriksaan</MenuItem>
        <MenuItem value="SELESAI">Selesai</MenuItem>
      </TextField>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No. Antrean</TableCell>
              <TableCell>No. Registrasi</TableCell>
              <TableCell>Pasien</TableCell>
              <TableCell>Dokter</TableCell>
              <TableCell>Poli</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center">Memuat data...</TableCell></TableRow>
            ) : registrations.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center">Belum ada pendaftaran</TableCell></TableRow>
            ) : (
              registrations.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell><strong>{r.queue?.nomorAntrean ?? '-'}</strong></TableCell>
                  <TableCell>{r.noRegistrasi}</TableCell>
                  <TableCell>{r.patient.nama}</TableCell>
                  <TableCell>{r.doctor.nama}</TableCell>
                  <TableCell>{r.poli.namaPoli}</TableCell>
                  <TableCell><Chip size="small" label={STATUS_LABEL[r.status]} color={STATUS_COLOR[r.status]} /></TableCell>
                  <TableCell align="center">
                    {isPetugas && r.status === 'MENUNGGU' && (
                      <Button size="small" onClick={() => handleCheckIn(r)} disabled={actionLoadingId === r.id}>Check In</Button>
                    )}
                    {isDokter && r.status === 'CHECK_IN' && r.queue?.status === 'MENUNGGU' && (
                      <Button size="small" variant="contained" onClick={() => handleCall(r)} disabled={actionLoadingId === r.id}>Panggil</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <RegistrationFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreateRegistration} serverError={formError} />

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}