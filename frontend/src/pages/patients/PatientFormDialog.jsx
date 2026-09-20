import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  MenuItem, Grid, Alert, Box, Typography, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 20px 40px -6px rgba(23, 35, 31, 0.16)',
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2.5,
              bgcolor: '#E8F2EE',
              color: '#1B4D3E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isEdit ? <EditOutlinedIcon sx={{ fontSize: 20 }} /> : <PersonAddOutlinedIcon sx={{ fontSize: 20 }} />}
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#121E1A', fontSize: 16 }}>
              {isEdit ? 'Ubah Data Pasien' : 'Registrasi Pasien Baru'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#526B62' }}>
              {isEdit ? 'Perbarui informasi identitas pasien terdaftar' : 'Lengkapi data identitas pasien untuk pembuatan No. RM'}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#707974' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {serverError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{serverError}</Alert>}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <Controller
              name="nik"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="NIK (Nomor Induk Kependudukan)"
                  disabled={isEdit}
                  error={!!errors.nik}
                  helperText={errors.nik?.message || (isEdit && 'NIK bersifat permanen dan tidak dapat diubah')}
                />
              )}
            />
          </Grid>
          <Grid size={12}>
            <Controller
              name="nama"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nama Lengkap Pasien"
                  error={!!errors.nama}
                  helperText={errors.nama?.message}
                />
              )}
            />
          </Grid>
          <Grid size={6}>
            <Controller
              name="jenisKelamin"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Jenis Kelamin"
                  error={!!errors.jenisKelamin}
                  helperText={errors.jenisKelamin?.message}
                >
                  <MenuItem value="L">Laki-laki (L)</MenuItem>
                  <MenuItem value="P">Perempuan (P)</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid size={6}>
            <Controller
              name="tanggalLahir"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  fullWidth
                  label="Tanggal Lahir"
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!errors.tanggalLahir}
                  helperText={errors.tanggalLahir?.message}
                />
              )}
            />
          </Grid>
          <Grid size={12}>
            <Controller
              name="noTelp"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nomor Telepon / WhatsApp"
                  error={!!errors.noTelp}
                  helperText={errors.noTelp?.message}
                />
              )}
            />
          </Grid>
          <Grid size={12}>
            <Controller
              name="alamat"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={2}
                  label="Alamat Domisili Lengkap"
                  error={!!errors.alamat}
                  helperText={errors.alamat?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#404945',
            fontWeight: 600,
            borderRadius: 2,
            px: 2,
          }}
        >
          Batal
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          sx={{
            bgcolor: '#1B4D3E',
            color: '#FFFFFF',
            fontWeight: 700,
            borderRadius: 2,
            px: 2.5,
            py: 0.9,
            '&:hover': { bgcolor: '#003629' },
          }}
        >
          {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Daftarkan Pasien'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}