const dashboardService = require('../services/dashboard.service');

async function summary(req, res) {
  const data = await dashboardService.getSummary();
  return res.success(data, 'Berhasil mengambil ringkasan dashboard');
}

module.exports = { summary };