import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem,
  Grid, Alert, FormControlLabel, Switch,
} from '@mui/material';
import { userCreateSchema, userUpdateSchema, ROLE_OPTIONS, ROLE_LABELS } from './userSchema';

const EMPTY_CREATE = { username: '', password: '', namaLengkap: '', role: '' };
const EMPTY_UPDATE = { password: '', namaLengkap: '', role: '', isActive: true };

export default function UserFormDialog({ open, onClose, onSubmit, initialData, serverError }) {
  const isEdit = Boolean(initialData);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(isEdit ? userUpdateSchema : userCreateSchema),
    defaultValues: isEdit ? EMPTY_UPDATE : EMPTY_CREATE,
  });

  useEffect(() => {
    if (open) {
      reset(
        isEdit
          ? { password: '', namaLengkap: initialData.namaLengkap, role: initialData.role, isActive: initialData.isActive }
          : EMPTY_CREATE
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const handleFormSubmit = (data) => {
    // Password kosong saat edit berarti "tidak diganti" - jangan dikirim ke server
    if (isEdit && !data.password) {
      const { password: _password, ...rest } = data;
      onSubmit(rest);
    } else {
      onSubmit(data);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Ubah Akun' : 'Tambah Akun'}</DialogTitle>
      <DialogContent>
        {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {isEdit ? (
            <Grid size={12}>
              <TextField fullWidth label="Username" value={initialData.username} disabled helperText="Username tidak bisa diubah" />
            </Grid>
          ) : (
            <Grid size={12}>
              <Controller name="username" control={control} render={({ field }) => (
                <TextField {...field} fullWidth label="Username" error={!!errors.username} helperText={errors.username?.message} />
              )} />
            </Grid>
          )}
          <Grid size={12}>
            <Controller name="namaLengkap" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Nama Lengkap" error={!!errors.namaLengkap} helperText={errors.namaLengkap?.message} />
            )} />
          </Grid>
          <Grid size={6}>
            <Controller name="role" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="Role" error={!!errors.role} helperText={errors.role?.message}>
                {ROLE_OPTIONS.map((r) => <MenuItem key={r} value={r}>{ROLE_LABELS[r]}</MenuItem>)}
              </TextField>
            )} />
          </Grid>
          <Grid size={6}>
            <Controller name="password" control={control} render={({ field }) => (
              <TextField
                {...field}
                type="password"
                fullWidth
                label={isEdit ? 'Password Baru (opsional)' : 'Password'}
                error={!!errors.password}
                helperText={errors.password?.message || (isEdit ? 'Kosongkan jika tidak ingin mengganti password' : undefined)}
              />
            )} />
          </Grid>
          {isEdit && (
            <Grid size={12}>
              <Controller name="isActive" control={control} render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={field.value ? 'Akun aktif' : 'Akun nonaktif'}
                />
              )} />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Batal</Button>
        <Button variant="contained" onClick={handleSubmit(handleFormSubmit)} disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
