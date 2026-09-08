const Joi = require('joi');

const registrationSchema = Joi.object({
  patientId: Joi.number().integer().positive().required().messages({
    'any.required': 'Pasien wajib dipilih',
  }),
  doctorId: Joi.number().integer().positive().required().messages({
    'any.required': 'Dokter wajib dipilih',
  }),
  poliId: Joi.number().integer().positive().required().messages({
    'any.required': 'Poli wajib dipilih',
  }),
  tanggalKunjungan: Joi.date().required().messages({
    'any.required': 'Tanggal kunjungan wajib diisi',
  }),
  jenisPembayaran: Joi.string().valid('UMUM', 'BPJS', 'ASURANSI').required().messages({
    'any.only': 'Jenis pembayaran harus UMUM, BPJS, atau ASURANSI',
  }),
  keluhanAwal: Joi.string().allow('', null),
});

const registrationUpdateSchema = Joi.object({
  jenisPembayaran: Joi.string().valid('UMUM', 'BPJS', 'ASURANSI'),
  keluhanAwal: Joi.string().allow('', null),
  status: Joi.string().valid('MENUNGGU', 'CHECK_IN', 'PEMERIKSAAN', 'SELESAI'),
})
  .min(1)
  .messages({ 'object.min': 'Minimal 1 field harus diisi untuk update' });

module.exports = { registrationSchema, registrationUpdateSchema };