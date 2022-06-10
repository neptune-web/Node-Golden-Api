const status = require("http-status");
const has = require("has-keys");

const addressModel = require("../models/addresses.js");
const userModel = require("../models/users");

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

  async selectAddress(req, res) {
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

    let user = await addressModel.selectAddress(user_id, wallet_address);
    let new_user = { ...user };
    delete new_user["nft_holder"];
    new_user["nft_holder"] = user.nft_holder === 1;

    res.json({
      user: new_user,
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

  async getAllWalletAddress(req, res) {
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
      address: addresses,
      status: status.OK,
    });

    return;
  },

  async addWalletAddressByPhone(req, res) {
    if (!has(req.body, ["phone"])) {
      res.json({
        message: "phone parameter is undefined",
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

    const { phone, wallet_address } = req.body;

    let user = await userModel.getUserByPhone(phone);

    let user_id;
    if (user) {
      user_id = user.user_id;
    } else {
      res.json({
        message: "user is not exist",
        status: status.OK,
      });
      return;
    }

    let existAddress = await addressModel.getAddresses(user_id, wallet_address);
    if (existAddress?.id) {
      await addressModel.selectAddress(user_id, wallet_address);

      res.json({
        address: existAddress,
        status: status.OK,
      });

      return;
    }

    let address = await addressModel.createAddress(user_id, wallet_address);

    await addressModel.selectAddress(user_id, wallet_address);

    res.json({
      address,
      status: status.OK,
    });
  },

  async deleteWalletAddress(req, res) {
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
    await addressModel.deleteAddress(user_id, wallet_address);

    res.json({
      message: "The address is deleted successfully",
      status: status.OK,
    });
  },
};
