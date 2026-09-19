const Joi = require('joi');

const medicineSchema = Joi.object({
  namaObat: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Nama obat wajib diisi',
    'any.required': 'Nama obat wajib diisi',
  }),
  satuan: Joi.string().min(2).max(30).required().messages({
    'string.empty': 'Satuan obat wajib diisi',
    'any.required': 'Satuan obat wajib diisi',
  }),
  harga: Joi.number().integer().min(0).required().messages({
    'number.base': 'Harga harus berupa angka',
    'any.required': 'Harga obat wajib diisi',
  }),
});

const medicineUpdateSchema = Joi.object({
  namaObat: Joi.string().min(2).max(100),
  satuan: Joi.string().min(2).max(30),
  harga: Joi.number().integer().min(0),
})
  .min(1)
  .messages({
    'object.min': 'Minimal 1 field harus diisi untuk update',
  });

module.exports = {
  medicineSchema,
  medicineUpdateSchema,
};
