const Joi = require('joi');

const paymentPaySchema = Joi.object({
  registrationId: Joi.number().integer().positive(),
  invoiceId: Joi.number().integer().positive(),
  metodePembayaran: Joi.string()
    .valid('TUNAI', 'QRIS', 'TRANSFER', 'GATEWAY', 'BPJS', 'ASURANSI')
    .default('GATEWAY')
    .messages({
      'any.only': 'Metode pembayaran tidak valid',
    }),
  paymentToken: Joi.string().allow('', null),
  amount: Joi.number().integer().min(0),
})
  .or('registrationId', 'invoiceId')
  .messages({
    'object.missing': 'registrationId atau invoiceId wajib disertakan',
  });

module.exports = { paymentPaySchema };
