const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicine.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { medicineSchema, medicineUpdateSchema } = require('../validations/medicine.validation');

router.use(authenticate);

// List & Detail obat: dapat diakses oleh Admin, Farmasi, dan Dokter
router.get('/', authorize('ADMIN', 'DOKTER', 'FARMASI'), medicineController.list);
router.get('/:id', authorize('ADMIN', 'DOKTER', 'FARMASI'), medicineController.detail);

// CRUD Master Obat: Hak khusus Administrator dan Petugas Farmasi
router.post('/', authorize('ADMIN', 'FARMASI'), validate(medicineSchema), medicineController.create);
router.put('/:id', authorize('ADMIN', 'FARMASI'), validate(medicineUpdateSchema), medicineController.update);
router.delete('/:id', authorize('ADMIN', 'FARMASI'), medicineController.remove);

module.exports = router;