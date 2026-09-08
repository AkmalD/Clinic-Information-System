const Joi = require('joi');

const patientSchema = Joi.object({
  nik: Joi.string()
    .pattern(/^\d{16}$/)
    .required()
    .messages({
      'string.pattern.base': 'NIK harus terdiri dari 16 digit angka',
      'string.empty': 'NIK wajib diisi',
    }),
  nama: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Nama minimal 3 karakter',
    'string.empty': 'Nama wajib diisi',
  }),
  jenisKelamin: Joi.string().valid('L', 'P').required().messages({
    'any.only': 'Jenis kelamin harus L atau P',
  }),
  tanggalLahir: Joi.date().max('now').required().messages({
    'date.max': 'Tanggal lahir tidak boleh di masa depan',
  }),
  noTelp: Joi.string()
    .pattern(/^[0-9+]{8,15}$/)
    .required()
    .messages({
      'string.pattern.base': 'Nomor telepon tidak valid (8-15 digit)',
    }),
  alamat: Joi.string().min(5).required().messages({
    'string.min': 'Alamat minimal 5 karakter',
  }),
});

module.exports = { patientSchema };