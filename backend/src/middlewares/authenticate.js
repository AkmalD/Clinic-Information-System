const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { isBlacklisted } = require('../utils/tokenBlacklist');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token tidak ditemukan, silakan login terlebih dahulu', 401));
  }

  const token = authHeader.split(' ')[1];

  if (isBlacklisted(token)) {
    return next(new AppError('Sesi sudah berakhir, silakan login ulang', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };
    req.token = token; // disimpan supaya bisa di-blacklist saat logout
    next();
  } catch (err) {
    next(err); // ditangkap errorHandler -> JsonWebTokenError / TokenExpiredError
  }
}

module.exports = authenticate;