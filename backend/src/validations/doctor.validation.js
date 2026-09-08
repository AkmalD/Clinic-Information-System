const Joi = require('joi');

const doctorSchema = Joi.object({
  nama: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Nama dokter minimal 3 karakter',
    'string.empty': 'Nama dokter wajib diisi',
  }),
  poliId: Joi.number().integer().positive().required().messages({
    'number.base': 'Poli wajib dipilih',
    'any.required': 'Poli wajib dipilih',
  }),
  noSip: Joi.string().max(50).allow('', null).messages({
    'string.max': 'No. SIP maksimal 50 karakter',
  }),
  // userId opsional: dipakai kalau dokter ini juga punya akun login (User.role = DOKTER)
  userId: Joi.number().integer().positive().allow(null).messages({
    'number.base': 'userId tidak valid',
  }),
});

// Update = partial: semua field jadi opsional, minimal 1 field harus dikirim
const doctorUpdateSchema = doctorSchema
  .fork(['nama', 'poliId', 'noSip', 'userId'], (field) => field.optional())
  .min(1)
  .messages({
    'object.min': 'Minimal 1 field harus diisi untuk update',
  });

module.exports = { doctorSchema, doctorUpdateSchema };