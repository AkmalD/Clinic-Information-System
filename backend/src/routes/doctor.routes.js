const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { doctorSchema, doctorUpdateSchema } = require('../validations/doctor.validation');

router.use(authenticate); // semua endpoint dokter wajib login

router.get('/', authorize('ADMIN', 'PETUGAS', 'DOKTER'), doctorController.list);
router.get('/:id', authorize('ADMIN', 'PETUGAS', 'DOKTER'), doctorController.detail);
router.post('/', authorize('ADMIN'), validate(doctorSchema), doctorController.create);
router.put('/:id', authorize('ADMIN'), validate(doctorUpdateSchema), doctorController.update);
router.delete('/:id', authorize('ADMIN'), doctorController.remove);

module.exports = router;