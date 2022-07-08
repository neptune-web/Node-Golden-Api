const { Joi } = require("express-validation");

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
  registerWallet: {
    body: Joi.object({
      phone: Joi.string().required(),
      wallet_address: Joi.string().required(),
    }),
  },
};
