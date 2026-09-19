const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { paymentPaySchema } = require('../validations/payment.validation');

router.use(authenticate);

// Endpoint Invoices
router.get('/invoices', authorize('ADMIN', 'PETUGAS'), paymentController.listInvoices);
router.get('/invoices/:registrationId', authorize('ADMIN', 'PETUGAS', 'DOKTER', 'FARMASI'), paymentController.getInvoiceByRegistration);

// Endpoint Payments
router.post('/payments/pay', authorize('ADMIN', 'PETUGAS'), validate(paymentPaySchema), paymentController.pay);

module.exports = router;
