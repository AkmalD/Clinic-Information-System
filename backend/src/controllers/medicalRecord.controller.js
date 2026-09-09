const medicalRecordService = require('../services/medicalRecord.service');

async function create(req, res) {
  const record = await medicalRecordService.createMedicalRecord(req.body);
  return res.success(record, 'Catatan pemeriksaan berhasil disimpan', 201);
}

async function historyByPatient(req, res) {
  const records = await medicalRecordService.getMedicalRecordsByPatient(req.params.patientId);
  return res.success(records, 'Berhasil mengambil riwayat pemeriksaan pasien');
}

module.exports = { create, historyByPatient };