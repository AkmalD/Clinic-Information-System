const Joi = require('joi');

const queueCreateSchema = Joi.object({
  registrationId: Joi.number().integer().positive().required().messages({
    'any.required': 'registrationId wajib diisi',
  }),
});

// Sengaja hanya izinkan 'SELESAI' di sini.
// Transisi MENUNGGU -> DIPANGGIL wajib lewat endpoint /call (ada efek cascade ke Registration).
const queueStatusSchema = Joi.object({
  status: Joi.string().valid('SELESAI').required().messages({
    'any.only': "Endpoint ini hanya untuk menandai 'SELESAI'. Untuk memanggil antrean, gunakan endpoint /call.",
    'any.required': 'Status wajib diisi',
  }),
});

module.exports = { queueCreateSchema, queueStatusSchema };