const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registration.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { registrationSchema, registrationUpdateSchema } = require('../validations/registration.validation');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'PETUGAS', 'DOKTER'), registrationController.list);
router.get('/:id', authorize('ADMIN', 'PETUGAS', 'DOKTER'), registrationController.detail);
router.post('/', authorize('PETUGAS'), validate(registrationSchema), registrationController.create);
router.put('/:id', authorize('PETUGAS'), validate(registrationUpdateSchema), registrationController.update);

module.exports = router;