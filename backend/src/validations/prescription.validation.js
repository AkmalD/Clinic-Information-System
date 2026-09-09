const Joi = require('joi');

const prescriptionItemSchema = Joi.object({
  medicineId: Joi.number().integer().positive().required().messages({ 'any.required': 'Obat wajib dipilih' }),
  dosis: Joi.string().required().messages({ 'any.required': 'Dosis wajib diisi' }),
  jumlah: Joi.number().integer().positive().required().messages({ 'any.required': 'Jumlah wajib diisi' }),
  aturanPakai: Joi.string().required().messages({ 'any.required': 'Aturan pakai wajib diisi' }),
});

const prescriptionSchema = Joi.object({
  medicalRecordId: Joi.number().integer().positive().required().messages({
    'any.required': 'medicalRecordId wajib diisi',
  }),
  items: Joi.array().items(prescriptionItemSchema).min(1).required().messages({
    'array.min': 'Resep harus berisi minimal 1 obat',
    'any.required': 'Daftar obat wajib diisi',
  }),
});

module.exports = { prescriptionSchema };