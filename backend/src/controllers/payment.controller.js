const paymentService = require('../services/payment.service');

async function listInvoices(req, res) {
  const { status, jenisPembayaran, date } = req.query;
  const invoices = await paymentService.getInvoices({ status, jenisPembayaran, date });
  return res.success(invoices, 'Berhasil mengambil daftar tagihan');
}

async function getInvoiceByRegistration(req, res) {
  const invoice = await paymentService.getInvoiceByRegistrationId(req.params.registrationId);
  return res.success(invoice, 'Berhasil mengambil rincian tagihan');
}

async function pay(req, res) {
  const result = await paymentService.processPayment(req.body);
  return res.success(result, 'Pembayaran berhasil diproses dan diverifikasi lunas');
}

module.exports = {
  listInvoices,
  getInvoiceByRegistration,
  pay,
};
