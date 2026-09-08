const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { patientSchema } = require('../validations/patient.validation');

router.use(authenticate); // semua endpoint pasien wajib login

router.get('/', authorize('ADMIN', 'PETUGAS', 'DOKTER'), patientController.list);
router.get('/:id', authorize('ADMIN', 'PETUGAS', 'DOKTER'), patientController.detail);
router.post('/', authorize('ADMIN', 'PETUGAS'), validate(patientSchema), patientController.create);
router.put('/:id', authorize('ADMIN', 'PETUGAS'), validate(patientSchema), patientController.update);
router.delete('/:id', authorize('ADMIN', 'PETUGAS'), patientController.remove);

module.exports = router;