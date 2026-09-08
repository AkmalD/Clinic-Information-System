const authService = require('../services/auth.service');
const { blacklistToken } = require('../utils/tokenBlacklist');

async function login(req, res) {
  const { username, password } = req.body;
  const result = await authService.login(username, password);
  return res.success(result, 'Login berhasil');
}

function logout(req, res) {
  blacklistToken(req.token);
  return res.success({}, 'Logout berhasil');
}

function me(req, res) {
  return res.success(req.user, 'Berhasil mengambil data user');
}

module.exports = { login, logout, me };