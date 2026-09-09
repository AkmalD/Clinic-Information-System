const prescriptionService = require('../services/prescription.service');

async function create(req, res) {
  const prescription = await prescriptionService.createPrescription(req.body);
  return res.success(prescription, 'Resep berhasil disimpan', 201);
}

async function detail(req, res) {
  const prescription = await prescriptionService.getPrescriptionById(req.params.id);
  return res.success(prescription, 'Berhasil mengambil detail resep');
}

module.exports = { create, detail };