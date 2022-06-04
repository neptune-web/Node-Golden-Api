const status = require("http-status");
const has = require("has-keys");

const addressModel = require("../models/addresses.js");

module.exports = {
  async getAddresses(req, res) {
    if (!has(req.body, ["user_id"])) {
      res.json({
        message: "user_id parameter is undefined",
        status: status.OK,
      });
      return;
    }

    const { user_id } = req.body;
    let addresses = await addressModel.getAddresses(user_id);

    res.json({
      addresses,
      status: status.OK,
    });
  },
};
