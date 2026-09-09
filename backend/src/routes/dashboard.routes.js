const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.get('/summary', authenticate, authorize('ADMIN', 'PETUGAS', 'DOKTER'), dashboardController.summary);

module.exports = router;