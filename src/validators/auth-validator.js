const { Joi } = require('express-validation')

module.exports = {
  verifyOPT: {
    body: Joi.object({
      phone: Joi.string().required(),
      pin: Joi.string().required(),
    }),
  },
  signUp: {
    body: Joi.object({
      phone: Joi.string().required(),
    }),
  },
  confirmSignUp: {
    body: Joi.object({
      phone: Joi.string().required(),
      pin: Joi.string().required(),
    }),
  },
  registerWallet: {
    body: Joi.object({
      phone: Joi.string().required(),
      wallet_address: Joi.string().required(),
    }),
  },
  deleteAccount: {
    body: Joi.object({
      phone: Joi.string().required(),
    }),
  },
  confirmDeleteAccount: {
    body: Joi.object({
      phone: Joi.string().required(),
      pin: Joi.string().required(),
      userId: Joi.string().required(),
    }),
  },
}
