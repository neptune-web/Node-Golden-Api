const status = require("http-status");
const has = require("has-keys");

const userModel = require("../models/users.js");
const verficationModel = require("../models/verfication");
const { uuid } = require("uuidv4");

var jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY, JWT_TOKEN_EXPIRATION } = process.env;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

module.exports = {
  async logIn(req, res) {
    if (!has(req.body, ["phone"])) {
      res.status(status.BAD_REQUEST).json();
      return;
    }

    const { phone } = req.body;

    let code = "";
    for (let i = 0; i < 4; i++) {
      code += getRandomInt(10);
    }
    code = "Ozone verification code is: " + code;
    console.log(client);

    await client.messages
      .create({
        body: code,
        from: process.env.TWILIO_PHONE,
        to: phone,
      })
      .then((message) => console.log(message.sid));

    await verficationModel.createVerification(phone, code);

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

    const { phone, pin } = req.body;

    let code = await verficationModel.getVerificationCode(phone);
    console.log("code=", code);
    if (code !== pin) {
      res.json({
        verified_pin: false,
        status: status.OK,
      });
      return;
    }

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
        verified_pin: true,
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
