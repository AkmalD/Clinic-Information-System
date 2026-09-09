import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody,
  Paper, TableContainer, IconButton, Chip, Snackbar, Alert, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import { useAuth } from '../../context/AuthContext';
import { getUsers, createUser, updateUser, deactivateUser } from '../../api/users.api';
import UserFormDialog from './UserFormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { ROLE_LABELS } from './userSchema';

export default function UsersPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formError, setFormError] = useState('');

  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchUsers = useCallback(() => {
    setLoading(true);
    getUsers({ role: roleFilter || undefined })
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  }, [roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openAddForm = () => { setEditingUser(null); setFormError(''); setFormOpen(true); };
  const openEditForm = (u) => { setEditingUser(u); setFormError(''); setFormOpen(true); };

  const handleFormSubmit = async (data) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data);
        setSnackbar({ open: true, message: 'Akun berhasil diperbarui', severity: 'success' });
      } else {
        await createUser(data);
        setSnackbar({ open: true, message: 'Akun berhasil ditambahkan', severity: 'success' });
      }
      setFormOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err?.message || 'Gagal menyimpan data');
    }
  };

  const handleDeactivate = async () => {
    setDeactivateLoading(true);
    try {
      await deactivateUser(deactivateTarget.id);
      setSnackbar({ open: true, message: 'Akun berhasil dinonaktifkan', severity: 'success' });
      setDeactivateTarget(null);
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err?.message || 'Gagal menonaktifkan akun', severity: 'error' });
    } finally {
      setDeactivateLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Akun & Role</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAddForm}>
          Tambah Akun
        </Button>
      </Box>

      <TextField
        select
        size="small"
        label="Filter Role"
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
        sx={{ mb: 2, width: 220 }}
      >
        <MenuItem value="">Semua Role</MenuItem>
        {Object.entries(ROLE_LABELS).map(([value, label]) => (
          <MenuItem key={value} value={value}>{label}</MenuItem>
        ))}
      </TextField>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Nama Lengkap</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center">Memuat data...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">Belum ada akun</TableCell></TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.namaLengkap}</TableCell>
                  <TableCell><Chip size="small" label={ROLE_LABELS[u.role]} /></TableCell>
                  <TableCell>
                    <Chip size="small" color={u.isActive ? 'success' : 'default'} label={u.isActive ? 'Aktif' : 'Nonaktif'} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEditForm(u)}><EditIcon fontSize="small" /></IconButton>
                    {u.isActive && u.id !== user?.id && (
                      <IconButton size="small" color="error" onClick={() => setDeactivateTarget(u)}>
                        <BlockIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <UserFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingUser}
        serverError={formError}
      />

      <ConfirmDialog
        open={Boolean(deactivateTarget)}
        title="Nonaktifkan Akun"
        description={`Yakin ingin menonaktifkan akun "${deactivateTarget?.username}"? Akun ini tidak akan bisa login sampai diaktifkan kembali lewat menu Ubah.`}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
        loading={deactivateLoading}
        confirmLabel="Nonaktifkan"
        loadingLabel="Menonaktifkan..."
        confirmColor="warning"
      />

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
