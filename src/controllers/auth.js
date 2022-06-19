const status = require("http-status");
const has = require("has-keys");

const userModel = require("../models/users.js");
const addressesModel = require("../models/addresses.js");
const verficationModel = require("../models/verfication");
const nftHolderModel = require("../models/nft_holder.js");

const { uuid } = require("uuidv4");

const axios = require("axios");

var jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY, JWT_TOKEN_EXPIRATION } = process.env;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const verifyNFTHolder = async (wallet_address, opensea_link) => {
  let links = opensea_link.split("/");
  if (links.length < 3) return false;
  let link = links[links.length - 1];

  const options = {
    method: "GET",
    url: "https://api.opensea.io/api/v1/assets",
    params: {
      owner: wallet_address,
      collection_slug: link,
    },
    headers: {
      "X-API-KEY": "2f6f419a083c46de9d83ce3dbe7db601",
    },
  };
  const response = await axios.request(options);
  console.log(response.data.assets);
  return response.data.assets.length > 0;
};

function validatePhoneNumber(input_str) {
  var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

  return re.test(input_str);
}

module.exports = {
  async logIn(req, res) {
    if (!has(req.body, ["phone"])) {
      res.status(status.BAD_REQUEST).json();
      return;
    }

    const { phone } = req.body;

    let users = await userModel.getUser(phone);

    if (users === undefined || users?.length === 0) {
      res.json({
        user_exist: false,
        status: status.OK,
      });
      return;
    }

    let code = "";
    for (let i = 0; i < 4; i++) {
      code += getRandomInt(10);
    }

    await client.messages
      .create({
        body: "Ozone verification code is: " + code,
        from: process.env.TWILIO_PHONE,
        to: phone,
      })
      .then((message) => console.log(message.sid));

    await verficationModel.createVerification(phone, code);

    res.json({
      user_exist: true,
      message: "PIN code is sent.",
      status: status.OK,
    });
  },

  async logInWithWeb(req, res) {
    if (!has(req.body, ["phone"])) {
      res.status(status.BAD_REQUEST).json();
      return;
    }

    const { phone } = req.body;

    let code = "";
    for (let i = 0; i < 4; i++) {
      code += getRandomInt(10);
    }

    await client.messages
      .create({
        body: "Ozone verification code is: " + code,
        from: process.env.TWILIO_PHONE,
        to: phone,
      })
      .then((message) => console.log(message.sid));

    await verficationModel.createVerification(phone, code);

    res.json({
      user_exist: true,
      message: "PIN code is sent.",
      status: status.OK,
    });
  },

  async getUserByPhone(req, res) {
    if (!has(req.body, ["phone"])) {
      res.json({
        message: "phone is undefined.",
        status: status.OK,
      });
      return;
    }

    const { phone } = req.body;

    const user = await userModel.getUserByPhone(phone);
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

      let new_user = { ...user };
      delete new_user["nft_holder"];
      new_user["nft_hoder"] = user["nft_holder"] === 1;

      res.json({
        user_exist: true,
        token: token,
        user: new_user,
        status: status.OK,
      });
    } else {
      res.json({
        user_exist: false,
        status: status.OK,
      });
    }
  },

  async verifyOPT(req, res) {
    if (!has(req.body, ["phone", "pin"])) {
      res.status(status.BAD_REQUEST).json();
      return;
    }

    const { phone, pin } = req.body;

    let code = await verficationModel.getVerificationCode(phone);

    if (code !== pin) {
      res.json({
        verified_pin: false,
        status: status.OK,
      });
      return;
    }

    const user = await userModel.getUserByPhone(phone);

    await verficationModel.removeVerification(phone);

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

      let new_user = { ...user };
      delete new_user["nft_holder"];
      new_user["nft_hoder"] = user["nft_holder"] === 1;

      res.json({
        verified_pin: true,
        user_exist: true,
        status: status.OK,
        token: token,
        user: new_user,
      });
    } else {
      res.json({
        verified_pin: true,
        user_exist: false,
        status: status.OK,
      });
    }
  },

  async verifyOPTWithWeb(req, res) {
    if (!has(req.body, ["phone", "pin"])) {
      res.status(status.BAD_REQUEST).json();
      return;
    }

    const { phone, pin } = req.body;

    let code = await verficationModel.getVerificationCode(phone);

    if (code !== pin) {
      res.json({
        verified_pin: false,
        status: status.OK,
      });
      return;
    }

    await verficationModel.removeVerification(phone);

    res.json({
      verified_pin: true,
      status: status.OK,
    });
  },

  async verifyWalletAddress(req, res) {
    if (!has(req.body, ["phone"])) {
      res.json({
        message: "phone parameter is not defined",
        status: status.BAD_REQUEST,
      });
      return;
    }
    if (!has(req.body, ["wallet_address"])) {
      res.json({
        message: "wallet_address parameter is not defined",
        status: status.BAD_REQUEST,
      });
      return;
    }

    if (!has(req.body, ["opensea_link"])) {
      res.json({
        message: "opensea_link parameter is not defined",
        status: status.BAD_REQUEST,
      });
      return;
    }
    const { phone, wallet_address, opensea_link } = req.body;
    const user = await userModel.getUser(phone);

    if (user?.user_id) {
      let holder_status = (await verifyNFTHolder(wallet_address, opensea_link))
        ? 1
        : 0;

      let holders = await nftHolderModel.getNFTHolder(
        wallet_address,
        opensea_link
      );

      let nft_holder;
      if (holders.length > 0) {
        nft_holder = await nftHolderModel.updateNFTHolder(
          wallet_address,
          opensea_link,
          holder_status
        );
      } else {
        nft_holder = await nftHolderModel.createNFTHolder(
          wallet_address,
          opensea_link,
          holder_status
        );
      }

      let new_nft_holder = { ...nft_holder };
      delete new_nft_holder["holder_status"];
      new_nft_holder["holder_status"] = nft_holder.holder_status === 1;

      res.json({
        nft_holder: new_nft_holder,
        status: status.OK,
      });
    } else {
      res.json({
        message: "User is not exist",
        status: status.OK,
      });
    }
  },

  async signUp(req, res) {
    if (!has(req.body, ["phone"])) {
      res.json({
        message: "phone parameter is not defined",
        status: status.BAD_REQUEST,
      });
      return;
    }
    if (!has(req.body, ["wallet_address"])) {
      res.json({
        message: "wallet_address parameter is not defined",
        status: status.BAD_REQUEST,
      });
      return;
    }
    const userId = uuid();
    const { phone, wallet_address } = req.body;

    if (!validatePhoneNumber(phone)) {
      res.json({
        message: "phone is invalid",
        status: status.BAD_REQUEST,
      });
      return;
    }
    // let nft_holder = (await verifyNFTHolder(wallet_address)) ? 1 : 0;
    let existingUser = await userModel.getUser(phone);
    let user;

    if (existingUser?.user_id) user = existingUser;
    else {
      user = await userModel.create(userId, phone, 0, 0);
    }

    if (user?.user_id) {
      let userId = user?.user_id;
      let existingAddress = await addressesModel.getAddress(
        userId,
        wallet_address
      );

      let addressId;
      if (existingAddress?.id) {
        addressId = existingAddress.id;
      } else {
        let address = await addressesModel.createAddress(
          user?.user_id,
          wallet_address
        );
        addressId = address.id;
      }

      user = await userModel.updateUserAddress(userId, addressId);

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

      let new_user = { ...user };
      delete new_user["nft_holder"];
      new_user["nft_hoder"] = user["nft_holder"] === 1;

      res.json({
        user_exist: true,
        status: status.OK,
        token: token,
        user: new_user,
      });
    } else {
      res.json({
        user_exist: false,
        status: status.OK,
      });
    }
  },
};
