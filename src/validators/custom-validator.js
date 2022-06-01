const { Joi } = require("express-validation");

module.exports = {
  verifyOwnership: {
    body: Joi.object({
      opensea_link: Joi.string().required(),
      metamask_address: Joi.string().required(),
    }),
  },
};
