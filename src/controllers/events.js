const status = require("http-status");
const has = require("has-keys");

const eventModel = require("../models/events.js");
const { uuid } = require("uuidv4");

var jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = process.env;

module.exports = {
  async createEvent(req, res) {
    const { user_id, code, name, link, date } = req.body;
    //let token = req.headers["authorization"];
    //let decoded = jwt.verify(token, JWT_SECRET_KEY);
    let userId = user_id;
    const event = await eventModel.createEvent(userId, code, name, link, date);
    res.json({
      status: status.OK,
      event: event,
    });
  },

  async getEvents(req, res) {
    const { user_id } = req.body;
    let userId = user_id;
    const events = await eventModel.getEvents(userId);
    res.json({
      status: status.OK,
      events: events,
    });
  },
};
