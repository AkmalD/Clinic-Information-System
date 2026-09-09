const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicine.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.use(authenticate);
router.get('/', authorize('ADMIN', 'DOKTER'), medicineController.list);

module.exports = router;