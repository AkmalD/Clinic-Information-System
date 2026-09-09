const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { prescriptionSchema } = require('../validations/prescription.validation');

router.use(authenticate);

router.post('/', authorize('DOKTER'), validate(prescriptionSchema), prescriptionController.create);
router.get('/:id', authorize('ADMIN', 'DOKTER'), prescriptionController.detail);

module.exports = router;