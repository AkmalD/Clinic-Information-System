const Joi = require('joi');

const doctorSchema = Joi.object({
  nama: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Nama dokter minimal 3 karakter',
    'string.empty': 'Nama dokter wajib diisi',
    'any.required': 'Nama dokter wajib diisi',
  }),
  poliId: Joi.number().integer().positive().required().messages({
    'number.base': 'Poli wajib dipilih',
    'any.required': 'Poli wajib dipilih',
  }),
  noSip: Joi.string().max(50).allow('', null).messages({
    'string.max': 'No. SIP maksimal 50 karakter',
  }),
  biayaKonsultasi: Joi.number().integer().min(0).default(50000).messages({
    'number.base': 'Biaya konsultasi harus berupa angka',
  }),
  userId: Joi.number().integer().positive().allow(null).messages({
    'number.base': 'userId tidak valid',
  }),
  username: Joi.string().alphanum().min(3).max(30).when('userId', {
    is: Joi.exist().not(null),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }).messages({
    'any.required': 'Username wajib diisi untuk akun login dokter',
    'string.min': 'Username minimal 3 karakter',
  }),
  password: Joi.string().min(6).when('userId', {
    is: Joi.exist().not(null),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }).messages({
    'any.required': 'Password wajib diisi untuk akun login dokter',
    'string.min': 'Password minimal 6 karakter',
  }),
});

// Update = partial: semua field jadi opsional, minimal 1 field harus dikirim
const doctorUpdateSchema = Joi.object({
  nama: Joi.string().min(3).max(100),
  poliId: Joi.number().integer().positive(),
  noSip: Joi.string().max(50).allow('', null),
  biayaKonsultasi: Joi.number().integer().min(0),
  userId: Joi.number().integer().positive(),
  isActive: Joi.boolean(),
  password: Joi.string().min(6),
})
  .min(1)
  .messages({
    'object.min': 'Minimal 1 field harus diisi untuk update',
  });

module.exports = { doctorSchema, doctorUpdateSchema };