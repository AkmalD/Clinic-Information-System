const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queue.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { queueCreateSchema, queueStatusSchema } = require('../validations/queue.validation');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'PETUGAS', 'DOKTER'), queueController.list);
router.post('/', authorize('PETUGAS'), validate(queueCreateSchema), queueController.create);
router.put('/:id/call', authorize('DOKTER'), queueController.call);
router.put('/:id/status', authorize('PETUGAS', 'DOKTER'), validate(queueStatusSchema), queueController.updateStatus);

module.exports = router;