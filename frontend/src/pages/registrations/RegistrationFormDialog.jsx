import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem,
  Grid, Alert, Autocomplete, CircularProgress,
} from '@mui/material';
import { registrationSchema } from './registrationSchema';
import { getPatients } from '../../api/patients.api';
import { getPoli } from '../../api/poli.api';
import { getDoctors } from '../../api/doctors.api';

const EMPTY_FORM = { patientId: null, poliId: '', doctorId: '', tanggalKunjungan: '', jenisPembayaran: '', keluhanAwal: '' };

export default function RegistrationFormDialog({ open, onClose, onSubmit, serverError }) {
  const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: EMPTY_FORM,
  });

  const [poliOptions, setPoliOptions] = useState([]);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);
  const [patientSearchLoading, setPatientSearchLoading] = useState(false);

  const selectedPoliId = watch('poliId');

  useEffect(() => {
    if (open) {
      reset(EMPTY_FORM);
      getPoli().then((res) => setPoliOptions(res.data));
    }
  }, [open, reset]);

  useEffect(() => {
    if (selectedPoliId) {
      getDoctors({ poliId: selectedPoliId }).then((res) => setDoctorOptions(res.data));
    } else {
      setDoctorOptions([]);
    }
  }, [selectedPoliId]);

  const searchTimeoutRef = useRef(null);

  const searchPatients = (query) => {
    clearTimeout(searchTimeoutRef.current);
    if (query.length < 2) return;
    searchTimeoutRef.current = setTimeout(() => {
      setPatientSearchLoading(true);
      getPatients({ search: query, limit: 10 })
        .then((res) => setPatientOptions(res.data.patients))
        .finally(() => setPatientSearchLoading(false));
    }, 400);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tambah Pendaftaran</DialogTitle>
      <DialogContent>
        {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <Controller
              name="patientId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={patientOptions}
                  value={patientOptions.find((p) => p.id === field.value) || null}
                  getOptionLabel={(opt) => (opt ? `${opt.nama} - ${opt.nik}` : '')}
                  isOptionEqualToValue={(opt, val) => opt.id === val?.id}
                  loading={patientSearchLoading}
                  onInputChange={(_, value, reason) => {
                    if (reason === 'input') {
                      searchPatients(value);
                    }

                    if (reason === 'clear') {
                      setPatientOptions([]);
                    }
                  }}
                  onChange={(_, value) => field.onChange(value?.id ?? null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cari Pasien (nama/NIK)"
                      error={!!errors.patientId}
                      helperText={errors.patientId?.message}
                      slotProps={{
                        ...params.slotProps,
                        input: {
                          ...params.slotProps?.input,
                          endAdornment: (
                            <>
                              {patientSearchLoading && <CircularProgress size={16} />}
                              {params.slotProps?.input?.endAdornment}
                            </>
                          ),
                        },
                      }}
                    />
                  )}
                />
              )}
            />
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
            <Controller name="doctorId" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="Dokter" disabled={!selectedPoliId}
                error={!!errors.doctorId} helperText={errors.doctorId?.message || (!selectedPoliId && 'Pilih poli dulu')}
                onChange={(e) => field.onChange(Number(e.target.value))}>
                {doctorOptions.map((d) => <MenuItem key={d.id} value={d.id}>{d.nama}</MenuItem>)}
              </TextField>
            )} />
          </Grid>
          <Grid size={6}>
            <Controller name="tanggalKunjungan" control={control} render={({ field }) => (
              <TextField {...field} type="date" fullWidth label="Tanggal Kunjungan" slotProps={{ inputLabel: { shrink: true }, }} error={!!errors.tanggalKunjungan} helperText={errors.tanggalKunjungan?.message} />
            )} />
          </Grid>
          <Grid size={6}>
            <Controller name="jenisPembayaran" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="Jenis Pembayaran" error={!!errors.jenisPembayaran} helperText={errors.jenisPembayaran?.message}>
                <MenuItem value="UMUM">Umum</MenuItem>
                <MenuItem value="BPJS">BPJS</MenuItem>
                <MenuItem value="ASURANSI">Asuransi</MenuItem>
              </TextField>
            )} />
          </Grid>
          <Grid size={12}>
            <Controller name="keluhanAwal" control={control} render={({ field }) => (
              <TextField {...field} fullWidth multiline rows={2} label="Keluhan Awal (opsional)" />
            )} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Batal</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Daftarkan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}