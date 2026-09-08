const patientService = require('../services/patient.service');

async function create(req, res) {
  const patient = await patientService.createPatient(req.body);
  return res.success(patient, 'Pasien berhasil ditambahkan', 201);
}

async function list(req, res) {
  const { search, page, limit } = req.query;
  const { patients, pagination } = await patientService.getPatients({ search, page, limit });
  return res.success({ patients, pagination }, 'Berhasil mengambil daftar pasien');
}

async function detail(req, res) {
  const patient = await patientService.getPatientById(req.params.id);
  return res.success(patient, 'Berhasil mengambil detail pasien');
}

async function update(req, res) {
  const patient = await patientService.updatePatient(req.params.id, req.body);
  return res.success(patient, 'Pasien berhasil diperbarui');
}

async function remove(req, res) {
  await patientService.deletePatient(req.params.id);
  return res.success({}, 'Pasien berhasil dihapus');
}

module.exports = { create, list, detail, update, remove };