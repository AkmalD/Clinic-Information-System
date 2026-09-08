const { Prisma } = require('@prisma/client');
const AppError = require('../utils/appError');

function errorHandler(err, req, res, next) {
  console.error(err);

  // Error kustom yang sengaja dilempar di controller/service
  if (err instanceof AppError) {
    return res.error(err.message, err.errors, err.statusCode);
  }

  // Error dari Prisma (misal NIK / No. RM duplikat -> unique constraint)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = err.meta?.target?.join(', ') || 'data';
      return res.error(`Data dengan ${field} tersebut sudah terdaftar`, { [field]: 'sudah digunakan' }, 409);
    }
    if (err.code === 'P2025') {
      return res.error('Data tidak ditemukan', {}, 404);
    }
    if (err.code === 'P2003') {
      return res.error('Data tidak bisa dihapus karena masih terkait dengan data lain', {}, 409);
    }
    return res.error('Terjadi kesalahan pada database', {}, 400);
  }

  // Error validasi (kalau nanti pakai Joi/express-validator dengan shape .name === 'ValidationError')
  if (err.name === 'ValidationError') {
    return res.error('Validation Error', err.errors || err.details || {}, 422);
  }

  // Error JWT
  if (err.name === 'JsonWebTokenError') {
    return res.error('Token tidak valid', {}, 401);
  }
  if (err.name === 'TokenExpiredError') {
    return res.error('Token sudah kedaluwarsa, silakan login ulang', {}, 401);
  }

  // Fallback untuk error tak terduga
  return res.error(
    process.env.NODE_ENV === 'production' ? 'Terjadi kesalahan pada server' : err.message,
    {},
    500
  );
}

function notFoundHandler(req, res) {
  res.error(`Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`, {}, 404);
}

module.exports = { errorHandler, notFoundHandler };