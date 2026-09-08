const poliService = require('../services/poli.service');

async function create(req, res) {
  const poli = await poliService.createPoli(req.body);
  return res.success(poli, 'Poli berhasil ditambahkan', 201);
}

async function list(req, res) {
  const { search } = req.query;
  const polis = await poliService.getPolis({ search });
  return res.success(polis, 'Berhasil mengambil daftar poli');
}

async function detail(req, res) {
  const poli = await poliService.getPoliById(req.params.id);
  return res.success(poli, 'Berhasil mengambil detail poli');
}

async function update(req, res) {
  const poli = await poliService.updatePoli(req.params.id, req.body);
  return res.success(poli, 'Poli berhasil diperbarui');
}

async function remove(req, res) {
  await poliService.deletePoli(req.params.id);
  return res.success({}, 'Poli berhasil dihapus');
}

module.exports = { create, list, detail, update, remove };