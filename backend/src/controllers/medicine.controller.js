const medicineService = require('../services/medicine.service');

async function list(req, res) {
  const medicines = await medicineService.getMedicines({ search: req.query.search });
  return res.success(medicines, 'Berhasil mengambil daftar obat');
}

async function detail(req, res) {
  const medicine = await medicineService.getMedicineById(req.params.id);
  return res.success(medicine, 'Berhasil mengambil detail obat');
}

async function create(req, res) {
  const medicine = await medicineService.createMedicine(req.body);
  return res.success(medicine, 'Obat berhasil ditambahkan ke katalog', 201);
}

async function update(req, res) {
  const medicine = await medicineService.updateMedicine(req.params.id, req.body);
  return res.success(medicine, 'Data obat berhasil diperbarui');
}

async function remove(req, res) {
  await medicineService.deleteMedicine(req.params.id);
  return res.success({}, 'Obat berhasil dihapus dari katalog');
}

module.exports = {
  list,
  detail,
  create,
  update,
  remove,
};