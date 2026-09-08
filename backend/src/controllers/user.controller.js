const userService = require('../services/user.service');

async function create(req, res) {
  const user = await userService.createUser(req.body);
  return res.success(user, 'User berhasil ditambahkan', 201);
}

async function list(req, res) {
  const users = await userService.getUsers({ role: req.query.role });
  return res.success(users, 'Berhasil mengambil daftar user');
}

async function detail(req, res) {
  const user = await userService.getUserById(req.params.id);
  return res.success(user, 'Berhasil mengambil detail user');
}

async function update(req, res) {
  const user = await userService.updateUser(req.params.id, req.body);
  return res.success(user, 'User berhasil diperbarui');
}

async function remove(req, res) {
  const user = await userService.deactivateUser(req.params.id);
  return res.success(user, 'User berhasil dinonaktifkan');
}

module.exports = { create, list, detail, update, remove };