import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody,
  Paper, TableContainer, IconButton, Pagination, InputAdornment, Chip, Snackbar, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../context/AuthContext';
import { getPatients, createPatient, updatePatient, deletePatient } from '../../api/patients.api';
import PatientFormDialog from './PatientFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function PatientsPage() {
  const { user } = useAuth();
  const canEdit = ['ADMIN', 'PETUGAS'].includes(user?.role); // Dokter view-only

  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchPatients = useCallback((page = 1) => {
    setLoading(true);
    getPatients({ page, limit: 10, search })
      .then((res) => {
        setPatients(res.data.patients);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchPatients(1), 400); // debounce search
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openAddForm = () => { setEditingPatient(null); setFormError(''); setFormOpen(true); };
  const openEditForm = (patient) => { setEditingPatient(patient); setFormError(''); setFormOpen(true); };

  const handleFormSubmit = async (data) => {
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, data);
        setSnackbar({ open: true, message: 'Pasien berhasil diperbarui', severity: 'success' });
      } else {
        await createPatient(data);
        setSnackbar({ open: true, message: 'Pasien berhasil ditambahkan', severity: 'success' });
      }
      setFormOpen(false);
      fetchPatients(pagination.page);
    } catch (err) {
      setFormError(err?.message || 'Gagal menyimpan data');
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deletePatient(deleteTarget.id);
      setSnackbar({ open: true, message: 'Pasien berhasil dihapus', severity: 'success' });
      setDeleteTarget(null);
      fetchPatients(pagination.page);
    } catch (err) {
      setSnackbar({ open: true, message: err?.message || 'Gagal menghapus data', severity: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Data Pasien</Typography>
        {canEdit && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAddForm}>
            Tambah Pasien
          </Button>
        )}
      </Box>

      <TextField
        placeholder="Cari nama, NIK, atau No. RM..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ mb: 2, width: 320 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
      />

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No. RM</TableCell>
              <TableCell>Nama</TableCell>
              <TableCell>NIK</TableCell>
              <TableCell>Jenis Kelamin</TableCell>
              <TableCell>No. Telepon</TableCell>
              {canEdit && <TableCell align="right">Aksi</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center">Memuat data...</TableCell></TableRow>
            ) : patients.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">Belum ada data pasien</TableCell></TableRow>
            ) : (
              patients.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.noRm}</TableCell>
                  <TableCell>{p.nama}</TableCell>
                  <TableCell>{p.nik}</TableCell>
                  <TableCell><Chip size="small" label={p.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} /></TableCell>
                  <TableCell>{p.noTelp}</TableCell>
                  {canEdit && (
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEditForm(p)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(p)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={pagination.totalPages} page={pagination.page} onChange={(_, page) => fetchPatients(page)} />
        </Box>
      )}

      <PatientFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingPatient}
        serverError={formError}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Data Pasien"
        description={`Yakin ingin menghapus data pasien "${deleteTarget?.nama}"? Tindakan ini tidak bisa dibatalkan.`}
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