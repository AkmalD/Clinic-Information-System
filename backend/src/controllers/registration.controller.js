const registrationService = require('../services/registration.service');

async function create(req, res) {
  const registration = await registrationService.createRegistration(req.body, req.user.id);
  return res.success(registration, 'Pendaftaran berhasil dibuat', 201);
}

async function list(req, res) {
  const { date, status } = req.query;
  const registrations = await registrationService.getRegistrations({ date, status });
  return res.success(registrations, 'Berhasil mengambil daftar pendaftaran');
}

async function detail(req, res) {
  const registration = await registrationService.getRegistrationById(req.params.id);
  return res.success(registration, 'Berhasil mengambil detail pendaftaran');
}

async function update(req, res) {
  const registration = await registrationService.updateRegistration(req.params.id, req.body);
  return res.success(registration, 'Pendaftaran berhasil diperbarui');
}

module.exports = { create, list, detail, update };