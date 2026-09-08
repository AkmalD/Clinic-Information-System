const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { userSchema, userUpdateSchema } = require('../validations/user.validation');

router.use(authenticate, authorize('ADMIN')); // seluruh modul ini khusus Admin

router.get('/', userController.list);
router.get('/:id', userController.detail);
router.post('/', validate(userSchema), userController.create);
router.put('/:id', validate(userUpdateSchema), userController.update);
router.delete('/:id', userController.remove);

module.exports = router;