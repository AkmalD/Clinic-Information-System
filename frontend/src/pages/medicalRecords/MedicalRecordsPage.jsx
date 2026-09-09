import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper,
  Button, Snackbar, Alert, Autocomplete, TextField, CircularProgress, Accordion, AccordionSummary,
  AccordionDetails, Chip, Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '../../context/AuthContext';
import { getRegistrations } from '../../api/registrations.api';
import { getPatients } from '../../api/patients.api';
import { createMedicalRecord, getMedicalRecordsByPatient } from '../../api/medicalRecords.api';
import { createPrescription } from '../../api/prescriptions.api';
import SoapFormDialog from './SoapFormDialog';
import PrescriptionFormDialog from './PrescriptionFormDialog';

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const isDokter = user?.role === 'DOKTER';

  const [tab, setTab] = useState(isDokter ? 'worklist' : 'history');

  const [worklist, setWorklist] = useState([]);
  const [worklistLoading, setWorklistLoading] = useState(true);
  const [soapOpen, setSoapOpen] = useState(false);
  const [soapError, setSoapError] = useState('');
  const [activeRegistration, setActiveRegistration] = useState(null);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState('');
  const [activeMedicalRecordId, setActiveMedicalRecordId] = useState(null);

  const [patientOptions, setPatientOptions] = useState([]);
  const [patientSearchLoading, setPatientSearchLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const fetchWorklist = useCallback(() => {
    setWorklistLoading(true);
    getRegistrations({ status: 'PEMERIKSAAN' }).then((res) => setWorklist(res.data)).finally(() => setWorklistLoading(false));
  }, []);

  useEffect(() => { if (isDokter) fetchWorklist(); }, [isDokter, fetchWorklist]);

  const openSoapForm = (registration) => {
    setActiveRegistration(registration);
    setSoapError('');
    setSoapOpen(true);
  };

  const handleSoapSubmit = async (data) => {
    try {
      const res = await createMedicalRecord({ ...data, registrationId: activeRegistration.id });
      setSoapOpen(false);
      setActiveMedicalRecordId(res.data.id);
      setPrescriptionError('');
      setPrescriptionOpen(true); // lanjut langsung ke form resep
      fetchWorklist();
      showSnackbar('Pemeriksaan berhasil disimpan');
    } catch (err) {
      setSoapError(err?.message || 'Gagal menyimpan pemeriksaan');
    }
  };

  const handlePrescriptionSubmit = async (data) => {
    try {
      await createPrescription({ medicalRecordId: activeMedicalRecordId, items: data.items });
      setPrescriptionOpen(false);
      showSnackbar('Resep berhasil disimpan');
    } catch (err) {
      setPrescriptionError(err?.message || 'Gagal menyimpan resep');
    }
  };

  const searchPatientHistory = (query) => {
    if (query.length < 2) return;
    setPatientSearchLoading(true);
    getPatients({ search: query, limit: 10 }).then((res) => setPatientOptions(res.data.patients)).finally(() => setPatientSearchLoading(false));
  };

  useEffect(() => {
    if (selectedPatient) {
      setHistoryLoading(true);
      getMedicalRecordsByPatient(selectedPatient.id).then((res) => setHistory(res.data)).finally(() => setHistoryLoading(false));
    } else {
      setHistory([]);
    }
  }, [selectedPatient]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>Pemeriksaan Dokter</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        {isDokter && <Tab label="Perlu Diperiksa" value="worklist" />}
        <Tab label="Riwayat Pasien" value="history" />
      </Tabs>

      {isDokter && tab === 'worklist' && (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>No. Antrean</TableCell>
                <TableCell>Pasien</TableCell>
                <TableCell>Poli</TableCell>
                <TableCell align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {worklistLoading ? (
                <TableRow><TableCell colSpan={4} align="center">Memuat data...</TableCell></TableRow>
              ) : worklist.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center">Tidak ada pasien yang perlu diperiksa</TableCell></TableRow>
              ) : (
                worklist.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell><strong>{r.queue?.nomorAntrean}</strong></TableCell>
                    <TableCell>{r.patient.nama}</TableCell>
                    <TableCell>{r.poli.namaPoli}</TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="contained" onClick={() => openSoapForm(r)}>Periksa</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 'history' && (
        <Box>
          <Autocomplete
            options={patientOptions}
            value={selectedPatient}
            getOptionLabel={(opt) => (opt ? `${opt.nama} - ${opt.nik}` : '')}
            isOptionEqualToValue={(opt, val) => opt.id === val?.id}
            loading={patientSearchLoading}
            onInputChange={(_, value, reason) => { if (reason === 'input') searchPatientHistory(value); }}
            onChange={(_, value) => setSelectedPatient(value)}
            sx={{ mb: 3, maxWidth: 400 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cari Pasien (nama/NIK)"
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...params.slotProps?.input,
                    endAdornment: (<>{patientSearchLoading && <CircularProgress size={16} />}{params.slotProps?.input?.endAdornment}</>),
                  },
                }}
              />
            )}
          />

          {historyLoading ? (
            <Typography color="text.secondary">Memuat riwayat...</Typography>
          ) : !selectedPatient ? (
            <Typography color="text.secondary">Cari pasien untuk melihat riwayat pemeriksaan.</Typography>
          ) : history.length === 0 ? (
            <Typography color="text.secondary">Belum ada riwayat pemeriksaan untuk pasien ini.</Typography>
          ) : (
            history.map((record) => (
              <Accordion key={record.id} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mr: 2 }}>
                    <Typography>{new Date(record.createdAt).toLocaleDateString('id-ID')} · {record.doctor.nama}</Typography>
                    <Typography color="text.secondary">{record.diagnosa}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2"><strong>Keluhan (S):</strong> {record.keluhan}</Typography>
                  <Typography variant="body2"><strong>Objective (O):</strong> TD {record.tekananDarah}, Suhu {record.suhuTubuh}°C, BB {record.beratBadan}kg, TB {record.tinggiBadan}cm</Typography>
                  <Typography variant="body2"><strong>Diagnosa (A):</strong> {record.diagnosa}</Typography>
                  <Typography variant="body2"><strong>Rencana Terapi (P):</strong> {record.rencanaTerapi}</Typography>

                  {record.medicalActions.length > 0 && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" fontWeight={600}>Tindakan Medis:</Typography>
                      {record.medicalActions.map((a) => <Chip key={a.id} label={a.namaTindakan} size="small" sx={{ mr: 0.5, mt: 0.5 }} />)}
                    </>
                  )}

                  {record.prescriptions.length > 0 && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" fontWeight={600}>Resep:</Typography>
                      {record.prescriptions.map((presc) => presc.items.map((item) => (
                        <Typography key={item.id} variant="body2">
                          • {item.medicine.namaObat} — {item.dosis}, {item.jumlah}x, {item.aturanPakai}
                        </Typography>
                      )))}
                    </>
                  )}
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Box>
      )}

      <SoapFormDialog open={soapOpen} onClose={() => setSoapOpen(false)} onSubmit={handleSoapSubmit} registration={activeRegistration} serverError={soapError} />
      <PrescriptionFormDialog open={prescriptionOpen} onClose={() => setPrescriptionOpen(false)} onSubmit={handlePrescriptionSubmit} serverError={prescriptionError} />

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}