const prescriptionService = require('../services/prescription.service');

async function create(req, res) {
  const prescription = await prescriptionService.createPrescription(req.body);
  return res.success(prescription, 'Resep berhasil disimpan', 201);
}

async function detail(req, res) {
  const prescription = await prescriptionService.getPrescriptionById(req.params.id);
  return res.success(prescription, 'Berhasil mengambil detail resep');
}

async function queue(req, res) {
  const { status } = req.query;
  const prescriptions = await prescriptionService.getPrescriptionQueue({ status });
  return res.success(prescriptions, 'Berhasil mengambil antrean resep farmasi');
}

async function dispense(req, res) {
  const result = await prescriptionService.dispensePrescription(req.params.id, req.user.id);
  return res.success(result, 'Obat berhasil diserahkan kepada pasien');
}

module.exports = {
  create,
  detail,
  queue,
  dispense,
};