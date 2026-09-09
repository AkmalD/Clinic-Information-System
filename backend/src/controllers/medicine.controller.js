const medicineService = require('../services/medicine.service');

async function list(req, res) {
  const medicines = await medicineService.getMedicines({ search: req.query.search });
  return res.success(medicines, 'Berhasil mengambil daftar obat');
}

module.exports = { list };