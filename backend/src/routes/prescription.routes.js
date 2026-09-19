const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { prescriptionSchema } = require('../validations/prescription.validation');

router.use(authenticate);

// Antrean resep farmasi (hanya yang sudah LUNAS / DIJAMIN)
router.get('/queue', authorize('ADMIN', 'FARMASI'), prescriptionController.queue);

// Detail resep
router.get('/:id', authorize('ADMIN', 'DOKTER', 'FARMASI'), prescriptionController.detail);

// Buat resep manual (jika terpisah dari SOAP)
router.post('/', authorize('DOKTER', 'ADMIN'), validate(prescriptionSchema), prescriptionController.create);

// Penyerahan obat oleh Petugas Farmasi
router.patch('/:id/dispense', authorize('ADMIN', 'FARMASI'), prescriptionController.dispense);

module.exports = router;