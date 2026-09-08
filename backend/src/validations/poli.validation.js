const Joi = require('joi');

const poliSchema = Joi.object({
  namaPoli: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Nama poli minimal 3 karakter',
    'string.empty': 'Nama poli wajib diisi',
  }),
});

module.exports = { poliSchema };