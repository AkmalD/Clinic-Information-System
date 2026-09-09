const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecord.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { medicalRecordSchema } = require('../validations/medicalRecord.validation');

router.use(authenticate);

router.post('/', authorize('DOKTER'), validate(medicalRecordSchema), medicalRecordController.create);
router.get('/:patientId', authorize('ADMIN', 'DOKTER'), medicalRecordController.historyByPatient);

module.exports = router;