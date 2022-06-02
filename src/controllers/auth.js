const status = require("http-status");
const has = require("has-keys");

const userModel = require("../models/users.js");
const { uuid } = require("uuidv4");

var jwt = require("jsonwebtoken");

module.exports = {
  async logIn(req, res) {
    if (!has(req.body, ["phone"])) {
      res.status(status.BAD_REQUEST).json();
      return;
    }

    const { phone } = req.body;
  },

  async verifyOPT(req, res) {
    if (!has(req.body, ["phone", "pin"])) {
      res.status(status.BAD_REQUEST).json();
      return;
    }
    res.json({
      user_exist: false,
      status: true,
    });
  },

  async signUp(req, res) {
    if (!has(req.body, ["phone"]) && !has(req.body, ["wallet_address"])) {
      res.status(status.BAD_REQUEST).json();
      return;
    }

    const userId = uuid();
    const { phone, wallet_address } = req.body;
    const user = await userModel.create(userId, phone, wallet_address);
    res.json({
      user: user,
    });
  },
};
