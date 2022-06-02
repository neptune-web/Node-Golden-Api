const status = require("http-status");
const has = require("has-keys");

const eventModel = require("../models/events.js");
const { uuid } = require("uuidv4");

var jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = process.env;

module.exports = {
  async createEvent(req, res) {
    let token = req.headers["authorization"];

    const { code, name, link, date } = req.body;
    let decoded = jwt.verify(token, JWT_SECRET_KEY);

    if (decoded) {
      let userId = decoded.uid;
      const event = await eventModel.createEvent(
        userId,
        code,
        name,
        link,
        date
      );
      res.json({
        status: status.OK,
        event: event,
      });
    } else {
      res.json({
        status: status.NETWORK_AUTHENTICATION_REQUIRED,
      });
    }
  },
};
