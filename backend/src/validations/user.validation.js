const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string().alphanum().min(4).max(30).required().messages({
    'string.alphanum': 'Username hanya boleh huruf dan angka',
    'string.min': 'Username minimal 4 karakter',
    'string.empty': 'Username wajib diisi',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password minimal 6 karakter',
    'string.empty': 'Password wajib diisi',
  }),
  role: Joi.string().valid('ADMIN', 'DOKTER', 'PETUGAS').required().messages({
    'any.only': 'Role harus salah satu dari ADMIN, DOKTER, PETUGAS',
  }),
  namaLengkap: Joi.string().min(3).max(100).required().messages({
    'string.empty': 'Nama lengkap wajib diisi',
  }),
});

// Username sengaja TIDAK bisa diubah lewat update (immutable) - penyederhanaan.
const userUpdateSchema = Joi.object({
  password: Joi.string().min(6).messages({ 'string.min': 'Password minimal 6 karakter' }),
  role: Joi.string().valid('ADMIN', 'DOKTER', 'PETUGAS'),
  namaLengkap: Joi.string().min(3).max(100),
  isActive: Joi.boolean(),
})
  .min(1)
  .messages({ 'object.min': 'Minimal 1 field harus diisi untuk update' });

module.exports = { userSchema, userUpdateSchema };