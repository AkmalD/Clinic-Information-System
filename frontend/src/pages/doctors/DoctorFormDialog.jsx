import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Grid, Alert } from '@mui/material';
import { doctorSchema } from './doctorSchema';
import { getPoli } from '../../api/poli.api';
import { getUsers } from '../../api/users.api';

const EMPTY_FORM = { nama: '', poliId: '', noSip: '', userId: null };

export default function DoctorFormDialog({ open, onClose, onSubmit, initialData, serverError, doctors }) {
  const isEdit = Boolean(initialData);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: EMPTY_FORM,
  });

  const [poliOptions, setPoliOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  useEffect(() => {
    if (open) {
      reset(
        initialData
          ? { nama: initialData.nama, poliId: initialData.poliId, noSip: initialData.noSip || '', userId: initialData.userId ?? null }
          : EMPTY_FORM
      );
      getPoli().then((res) => setPoliOptions(res.data));
      // Hanya akun dengan role DOKTER yang boleh ditautkan ke data dokter
      getUsers({ role: 'DOKTER' }).then((res) => setUserOptions(res.data));
    }
  }, [open, initialData, reset]);

  // Akun yang sudah ditautkan ke dokter lain tidak boleh dipilih lagi,
  // kecuali akun yang memang sedang ditautkan ke dokter yang sedang diedit ini
  const linkedElsewhereIds = new Set(
    (doctors || [])
      .filter((d) => d.userId && d.id !== initialData?.id)
      .map((d) => d.userId)
  );
  const availableUsers = userOptions.filter((u) => !linkedElsewhereIds.has(u.id));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Ubah Data Dokter' : 'Tambah Dokter'}</DialogTitle>
      <DialogContent>
        {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <Controller name="nama" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Nama Dokter" placeholder="dr. Siti Aminah" error={!!errors.nama} helperText={errors.nama?.message} />
            )} />
          </Grid>
          <Grid size={6}>
            <Controller name="poliId" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="Poli" error={!!errors.poliId} helperText={errors.poliId?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}>
                {poliOptions.map((p) => <MenuItem key={p.id} value={p.id}>{p.namaPoli}</MenuItem>)}
              </TextField>
            )} />
          </Grid>
          <Grid size={6}>
            <Controller name="noSip" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="No. SIP (opsional)" error={!!errors.noSip} helperText={errors.noSip?.message} />
            )} />
          </Grid>
          <Grid size={12}>
            <Controller name="userId" control={control} render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                select
                fullWidth
                label="Tautkan ke Akun Login (opsional)"
                helperText="Hanya akun dengan role Dokter yang belum ditautkan ke dokter lain"
                onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
              >
                <MenuItem value="">— Tidak ditautkan —</MenuItem>
                {availableUsers.map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.namaLengkap} ({u.username})</MenuItem>
                ))}
              </TextField>
            )} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Batal</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
