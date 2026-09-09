import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, Alert, IconButton, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { getMedicines } from '../../api/medicines.api';

const prescriptionSchema = z.object({
  items: z.array(z.object({
    medicineId: z.number({ invalid_type_error: 'Obat wajib dipilih' }),
    dosis: z.string().min(1, 'Dosis wajib diisi'),
    jumlah: z.coerce.number().int().positive('Jumlah wajib diisi'),
    aturanPakai: z.string().min(1, 'Aturan pakai wajib diisi'),
  })).min(1, 'Minimal 1 obat'),
});

const EMPTY_ITEM = { medicineId: '', dosis: '', jumlah: '', aturanPakai: '' };

export default function PrescriptionFormDialog({ open, onClose, onSubmit, serverError }) {
  const [medicineOptions, setMedicineOptions] = useState([]);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: { items: [EMPTY_ITEM] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    if (open) {
      reset({ items: [EMPTY_ITEM] });
      getMedicines().then((res) => setMedicineOptions(res.data));
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Resep Obat</DialogTitle>
      <DialogContent>
        {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

        {fields.map((item, index) => (
          <Grid container spacing={1} key={item.id} sx={{ mb: 2 }} alignItems="flex-start">
            <Grid size={4}>
              <Controller name={`items.${index}.medicineId`} control={control} render={({ field }) => (
                <TextField {...field} select fullWidth size="small" label="Obat"
                  error={!!errors.items?.[index]?.medicineId} helperText={errors.items?.[index]?.medicineId?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}>
                  {medicineOptions.map((m) => <MenuItem key={m.id} value={m.id}>{m.namaObat}</MenuItem>)}
                </TextField>
              )} />
            </Grid>
            <Grid size={2}>
              <Controller name={`items.${index}.dosis`} control={control} render={({ field }) => (
                <TextField {...field} fullWidth size="small" label="Dosis" placeholder="3x1" error={!!errors.items?.[index]?.dosis} helperText={errors.items?.[index]?.dosis?.message} />
              )} />
            </Grid>
            <Grid size={2}>
              <Controller name={`items.${index}.jumlah`} control={control} render={({ field }) => (
                <TextField {...field} fullWidth size="small" type="number" label="Jumlah" error={!!errors.items?.[index]?.jumlah} helperText={errors.items?.[index]?.jumlah?.message} />
              )} />
            </Grid>
            <Grid size={3}>
              <Controller name={`items.${index}.aturanPakai`} control={control} render={({ field }) => (
                <TextField {...field} fullWidth size="small" label="Aturan Pakai" placeholder="Sesudah makan" error={!!errors.items?.[index]?.aturanPakai} helperText={errors.items?.[index]?.aturanPakai?.message} />
              )} />
            </Grid>
            <Grid size={1}>
              <IconButton size="small" color="error" onClick={() => remove(index)} disabled={fields.length === 1}><DeleteIcon fontSize="small" /></IconButton>
            </Grid>
          </Grid>
        ))}

        <Button size="small" startIcon={<AddIcon />} onClick={() => append(EMPTY_ITEM)}>Tambah Obat</Button>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Lewati</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Simpan Resep'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}