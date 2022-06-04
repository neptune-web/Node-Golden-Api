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

  async addWalletAddress(req, res) {
    if (!has(req.body, ["user_id"])) {
      res.json({
        message: "user_id parameter is undefined",
        status: status.OK,
      });
      return;
    }

    if (!has(req.body, ["wallet_address"])) {
      res.json({
        message: "wallet_address parameter is undefined",
        status: status.OK,
      });
      return;
    }

    const { user_id, wallet_address } = req.body;

    let existAddress = await addressModel.getAddress(user_id, wallet_address);
    if (existAddress?.id) {
      res.json({
        address: existAddress,
        status: status.OK,
      });
      return;
    }
    let address = await addressModel.createAddress(user_id, wallet_address);

    res.json({
      address,
      status: status.OK,
    });
  },
};
