import { useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, Alert,
  Typography, IconButton, Divider, Box,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const soapSchema = z.object({
  keluhan: z.string().min(1, 'Keluhan wajib diisi'),
  tekananDarah: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Format harus seperti 120/80'),
  suhuTubuh: z.coerce.number().min(30, 'Suhu tidak wajar').max(45, 'Suhu tidak wajar'),
  beratBadan: z.coerce.number().positive('Berat badan wajib diisi'),
  tinggiBadan: z.coerce.number().positive('Tinggi badan wajib diisi'),
  diagnosa: z.string().min(1, 'Diagnosa wajib diisi'),
  rencanaTerapi: z.string().min(1, 'Rencana terapi wajib diisi'),
  tindakanMedis: z.array(z.object({
    namaTindakan: z.string().min(1, 'Nama tindakan wajib diisi'),
    keterangan: z.string().optional(),
  })),
});

const EMPTY_FORM = {
  keluhan: '', tekananDarah: '', suhuTubuh: '', beratBadan: '', tinggiBadan: '',
  diagnosa: '', rencanaTerapi: '', tindakanMedis: [],
};

export default function SoapFormDialog({ open, onClose, onSubmit, registration, serverError }) {
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(soapSchema),
    defaultValues: EMPTY_FORM,
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'tindakanMedis' });

  useEffect(() => { if (open) reset(EMPTY_FORM); }, [open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Pemeriksaan SOAP
        {registration && (
          <Typography variant="body2" color="text.secondary">
            {registration.patient.nama} · Antrean {registration.queue?.nomorAntrean}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

        <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>Subjective</Typography>
        <Controller name="keluhan" control={control} render={({ field }) => (
          <TextField {...field} fullWidth multiline rows={2} label="Keluhan Pasien" error={!!errors.keluhan} helperText={errors.keluhan?.message} />
        )} />

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Objective</Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Controller name="tekananDarah" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Tekanan Darah" placeholder="120/80" error={!!errors.tekananDarah} helperText={errors.tekananDarah?.message} />
            )} />
          </Grid>
          <Grid size={6}>
            <Controller name="suhuTubuh" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="number" label="Suhu Tubuh (°C)" error={!!errors.suhuTubuh} helperText={errors.suhuTubuh?.message} />
            )} />
          </Grid>
          <Grid size={6}>
            <Controller name="beratBadan" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="number" label="Berat Badan (kg)" error={!!errors.beratBadan} helperText={errors.beratBadan?.message} />
            )} />
          </Grid>
          <Grid size={6}>
            <Controller name="tinggiBadan" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="number" label="Tinggi Badan (cm)" error={!!errors.tinggiBadan} helperText={errors.tinggiBadan?.message} />
            )} />
          </Grid>
        </Grid>

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Assessment</Typography>
        <Controller name="diagnosa" control={control} render={({ field }) => (
          <TextField {...field} fullWidth multiline rows={2} label="Diagnosa" error={!!errors.diagnosa} helperText={errors.diagnosa?.message} />
        )} />

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Plan</Typography>
        <Controller name="rencanaTerapi" control={control} render={({ field }) => (
          <TextField {...field} fullWidth multiline rows={2} label="Rencana Terapi" error={!!errors.rencanaTerapi} helperText={errors.rencanaTerapi?.message} />
        )} />

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2">Tindakan Medis (opsional)</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={() => append({ namaTindakan: '', keterangan: '' })}>Tambah</Button>
        </Box>
        {fields.map((item, index) => (
          <Grid container spacing={1} key={item.id} sx={{ mb: 1 }} alignItems="center">
            <Grid size={5}>
              <Controller name={`tindakanMedis.${index}.namaTindakan`} control={control} render={({ field }) => (
                <TextField {...field} fullWidth size="small" label="Nama Tindakan"
                  error={!!errors.tindakanMedis?.[index]?.namaTindakan}
                  helperText={errors.tindakanMedis?.[index]?.namaTindakan?.message} />
              )} />
            </Grid>
            <Grid size={6}>
              <Controller name={`tindakanMedis.${index}.keterangan`} control={control} render={({ field }) => (
                <TextField {...field} fullWidth size="small" label="Keterangan" />
              )} />
            </Grid>
            <Grid size={1}>
              <IconButton size="small" color="error" onClick={() => remove(index)}><DeleteIcon fontSize="small" /></IconButton>
            </Grid>
          </Grid>
        ))}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Batal</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Simpan Pemeriksaan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}