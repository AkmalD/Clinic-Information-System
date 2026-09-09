const Joi = require('joi');

const medicalActionItemSchema = Joi.object({
  namaTindakan: Joi.string().min(3).required().messages({
    'any.required': 'Nama tindakan wajib diisi',
  }),
  keterangan: Joi.string().allow('', null),
});

const medicalRecordSchema = Joi.object({
  registrationId: Joi.number().integer().positive().required().messages({
    'any.required': 'registrationId wajib diisi',
  }),
  keluhan: Joi.string().required().messages({ 'any.required': 'Keluhan (Subjective) wajib diisi' }),
  tekananDarah: Joi.string()
    .pattern(/^\d{2,3}\/\d{2,3}$/)
    .required()
    .messages({
      'string.pattern.base': 'Format tekanan darah harus seperti "120/80"',
      'any.required': 'Tekanan darah wajib diisi',
    }),
  suhuTubuh: Joi.number().min(30).max(45).required().messages({
    'number.min': 'Suhu tubuh tidak wajar (di bawah 30°C)',
    'number.max': 'Suhu tubuh tidak wajar (di atas 45°C)',
    'any.required': 'Suhu tubuh wajib diisi',
  }),
  beratBadan: Joi.number().positive().required().messages({ 'any.required': 'Berat badan wajib diisi' }),
  tinggiBadan: Joi.number().positive().required().messages({ 'any.required': 'Tinggi badan wajib diisi' }),
  diagnosa: Joi.string().required().messages({ 'any.required': 'Diagnosa (Assessment) wajib diisi' }),
  rencanaTerapi: Joi.string().required().messages({ 'any.required': 'Rencana terapi (Plan) wajib diisi' }),
  tindakanMedis: Joi.array().items(medicalActionItemSchema).default([]),
});

module.exports = { medicalRecordSchema };