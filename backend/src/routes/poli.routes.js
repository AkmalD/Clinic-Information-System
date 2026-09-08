const express = require('express');
const router = express.Router();
const poliController = require('../controllers/poli.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { poliSchema } = require('../validations/poli.validation');

router.use(authenticate); // semua endpoint poli wajib login

router.get('/', authorize('ADMIN', 'PETUGAS', 'DOKTER'), poliController.list);
router.get('/:id', authorize('ADMIN', 'PETUGAS', 'DOKTER'), poliController.detail);
router.post('/', authorize('ADMIN'), validate(poliSchema), poliController.create);
router.put('/:id', authorize('ADMIN'), validate(poliSchema), poliController.update);
router.delete('/:id', authorize('ADMIN'), poliController.remove);

module.exports = router;