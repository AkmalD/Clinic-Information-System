const doctorService = require('../services/doctor.service');

async function create(req, res) {
  const doctor = await doctorService.createDoctor(req.body);
  return res.success(doctor, 'Dokter berhasil ditambahkan', 201);
}

async function list(req, res) {
  const { search, poliId } = req.query;
  const doctors = await doctorService.getDoctors({ search, poliId });
  return res.success(doctors, 'Berhasil mengambil daftar dokter');
}

async function detail(req, res) {
  const doctor = await doctorService.getDoctorById(req.params.id);
  return res.success(doctor, 'Berhasil mengambil detail dokter');
}

async function update(req, res) {
  const doctor = await doctorService.updateDoctor(req.params.id, req.body);
  return res.success(doctor, 'Dokter berhasil diperbarui');
}

async function remove(req, res) {
  await doctorService.deleteDoctor(req.params.id);
  return res.success({}, 'Dokter berhasil dihapus');
}

module.exports = { create, list, detail, update, remove };