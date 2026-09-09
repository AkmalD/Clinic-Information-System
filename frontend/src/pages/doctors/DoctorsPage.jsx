import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody,
  Paper, TableContainer, IconButton, InputAdornment, Chip, Snackbar, Alert, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../context/AuthContext';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../../api/doctors.api';
import { getPoli } from '../../api/poli.api';
import DoctorFormDialog from './DoctorFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function DoctorsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN';

  const [doctors, setDoctors] = useState([]);
  const [poliOptions, setPoliOptions] = useState([]);
  const [search, setSearch] = useState('');
  const [poliFilter, setPoliFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchDoctors = useCallback(() => {
    setLoading(true);
    getDoctors({ search: search || undefined, poliId: poliFilter || undefined })
      .then((res) => setDoctors(res.data))
      .finally(() => setLoading(false));
  }, [search, poliFilter]);

  useEffect(() => {
    getPoli().then((res) => setPoliOptions(res.data));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchDoctors, 400); // debounce search
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, poliFilter]);

  const openAddForm = () => { setEditingDoctor(null); setFormError(''); setFormOpen(true); };
  const openEditForm = (doctor) => { setEditingDoctor(doctor); setFormError(''); setFormOpen(true); };

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
    setDeleteLoading(true);
    try {
      await deleteDoctor(deleteTarget.id);
      setSnackbar({ open: true, message: 'Dokter berhasil dihapus', severity: 'success' });
      setDeleteTarget(null);
      fetchDoctors();
    } catch (err) {
      setSnackbar({ open: true, message: err?.message || 'Gagal menghapus data', severity: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Data Dokter</Typography>
        {canEdit && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAddForm}>
            Tambah Dokter
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          placeholder="Cari nama dokter..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: 280 }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            },
          }}
        />
        <TextField
          select
          size="small"
          label="Filter Poli"
          value={poliFilter}
          onChange={(e) => setPoliFilter(e.target.value)}
          sx={{ width: 220 }}
        >
          <MenuItem value="">Semua Poli</MenuItem>
          {poliOptions.map((p) => <MenuItem key={p.id} value={p.id}>{p.namaPoli}</MenuItem>)}
        </TextField>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nama</TableCell>
              <TableCell>Poli</TableCell>
              <TableCell>No. SIP</TableCell>
              <TableCell>Akun Login</TableCell>
              {canEdit && <TableCell align="right">Aksi</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center">Memuat data...</TableCell></TableRow>
            ) : doctors.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">Belum ada data dokter</TableCell></TableRow>
            ) : (
              doctors.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell>{d.nama}</TableCell>
                  <TableCell>{d.poli?.namaPoli}</TableCell>
                  <TableCell>{d.noSip || '-'}</TableCell>
                  <TableCell>
                    <Chip size="small" color={d.userId ? 'success' : 'default'} label={d.userId ? 'Terhubung' : 'Belum ditautkan'} />
                  </TableCell>
                  {canEdit && (
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEditForm(d)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(d)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <DoctorFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingDoctor}
        serverError={formError}
        doctors={doctors}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Data Dokter"
        description={`Yakin ingin menghapus data dokter "${deleteTarget?.nama}"? Tindakan ini tidak bisa dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
