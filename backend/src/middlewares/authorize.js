const AppError = require('../utils/appError');

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Anda belum login', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(`Role '${req.user.role}' tidak memiliki akses ke resource ini`, 403)
      );
    }

    next();
  };
}

module.exports = authorize;