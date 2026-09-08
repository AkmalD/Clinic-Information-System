const queueService = require('../services/queue.service');

async function create(req, res) {
  const queue = await queueService.createQueue(req.body.registrationId);
  return res.success(queue, 'Antrean berhasil dibuat', 201);
}

async function list(req, res) {
  const { tanggal, poliId, status } = req.query;
  const queues = await queueService.getQueues({ tanggal, poliId, status });
  return res.success(queues, 'Berhasil mengambil daftar antrean');
}

async function call(req, res) {
  const queue = await queueService.callQueue(req.params.id);
  return res.success(queue, 'Antrean berhasil dipanggil');
}

async function updateStatus(req, res) {
  const queue = await queueService.updateQueueStatus(req.params.id, req.body.status);
  return res.success(queue, 'Status antrean berhasil diperbarui');
}

module.exports = { create, list, call, updateStatus };