const status = require("http-status");
const has = require("has-keys");

const userModel = require("../models/users.js");
const { uuid } = require("uuidv4");

var jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY, JWT_TOKEN_EXPIRATION } = process.env;

module.exports = {
  async logIn(req, res) {
    if (!has(req.body, ["phone"])) {
      res.status(status.BAD_REQUEST).json();
      return;
    }

    const { phone } = req.body;
    res.json({
      status: status.OK,
      message: "PIN code is sent.",
    });
  },

  async verifyOPT(req, res) {
    if (!has(req.body, ["phone", "pin"])) {
      res.status(status.BAD_REQUEST).json();
      return;
    }

    const { phone } = req.body;
    const user = await userModel.getUser(phone);
    console.log(user);

    if (user?.user_id) {
      const token = jwt.sign(
        {
          uid: user.user_id,
          userData: {
            userId: user.user_id,
            walletAddress: user.wallet_address,
          },
        },
        JWT_SECRET_KEY,
        {
          expiresIn: JWT_TOKEN_EXPIRATION,
        }
      );
      res.json({
        user_exist: true,
        status: status.OK,
        token: token,
        user: user,
      });
    } else {
      res.json({
        user_exist: false,
        status: status.OK,
      });
    }
  },

  async signUp(req, res) {
    if (!has(req.body, ["phone"]) && !has(req.body, ["wallet_address"])) {
      res.status(status.BAD_REQUEST).json();
      return;
    }

    const userId = uuid();
    const { phone, wallet_address } = req.body;
    const user = await userModel.create(userId, phone, wallet_address);

    if (user?.user_id) {
      const token = jwt.sign(
        {
          uid: user.user_id,
          userData: {
            userId: user.user_id,
            walletAddress: user.wallet_address,
          },
        },
        JWT_SECRET_KEY,
        {
          expiresIn: JWT_TOKEN_EXPIRATION,
        }
      );
      res.json({
        user_exist: true,
        status: status.OK,
        token: token,
        user: user,
      });
    } else {
      res.json({
        user_exist: false,
        status: status.OK,
      });
    }
  },
};
