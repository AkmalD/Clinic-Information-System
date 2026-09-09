import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Grid, Alert } from '@mui/material';
import { patientSchema } from './patientSchema';

const EMPTY_FORM = { nik: '', nama: '', jenisKelamin: '', tanggalLahir: '', noTelp: '', alamat: '' };

export default function PatientFormDialog({ open, onClose, onSubmit, initialData, serverError }) {
  const isEdit = Boolean(initialData);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (open) {
      reset(initialData ? { ...initialData, tanggalLahir: initialData.tanggalLahir?.slice(0, 10) } : EMPTY_FORM);
    }
  }, [open, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Ubah Data Pasien' : 'Tambah Pasien'}</DialogTitle>
      <DialogContent>
        {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <Controller name="nik" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="NIK" disabled={isEdit} error={!!errors.nik} helperText={errors.nik?.message || (isEdit && 'NIK tidak bisa diubah setelah dibuat')} />
            )} />
          </Grid>
          <Grid size={12}>
            <Controller name="nama" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Nama Pasien" error={!!errors.nama} helperText={errors.nama?.message} />
            )} />
          </Grid>
          <Grid size={6}>
            <Controller name="jenisKelamin" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="Jenis Kelamin" error={!!errors.jenisKelamin} helperText={errors.jenisKelamin?.message}>
                <MenuItem value="L">Laki-laki</MenuItem>
                <MenuItem value="P">Perempuan</MenuItem>
              </TextField>
            )} />
          </Grid>
          <Grid size={6}>
            <Controller name="tanggalLahir" control={control} render={({ field }) => (
              <TextField {...field} type="date" fullWidth label="Tanggal Lahir" slotProps={{ inputLabel: { shrink: true } }} error={!!errors.tanggalLahir} helperText={errors.tanggalLahir?.message} />
            )} />
          </Grid>
          <Grid size={12}>
            <Controller name="noTelp" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Nomor Telepon" error={!!errors.noTelp} helperText={errors.noTelp?.message} />
            )} />
          </Grid>
          <Grid size={12}>
            <Controller name="alamat" control={control} render={({ field }) => (
              <TextField {...field} fullWidth multiline rows={2} label="Alamat" error={!!errors.alamat} helperText={errors.alamat?.message} />
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