const status = require("http-status");
const has = require("has-keys");

const eventModel = require("../models/events.js");
const nftHolderModel = require("../models/nft_holder.js");

const axios = require("axios");

//var jwt = require("jsonwebtoken");
//const { JWT_SECRET_KEY } = process.env;
var QRCode = require("qrcode");
const events = require("../models/events.js");

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const verifyNFTHolder = async (wallet_address, opensea_link) => {
  const options = {
    method: "GET",
    url: "https://api.opensea.io/api/v1/assets",
    params: {
      owner: wallet_address,
      collection_slug: opensea_link.slice(30),
    },
    headers: {
      Accept: "application/json",
      "X-API-KEY": "2f6f419a083c46de9d83ce3dbe7db601",
    },
  };
  const response = await axios.request(options);
  return response.data.assets.length > 0;
};

module.exports = {
  async createEvent(req, res) {
    const { user_id, name, link, date } = req.body;
    //let token = req.headers["authorization"];
    //let decoded = jwt.verify(token, JWT_SECRET_KEY);
    let userId = user_id;
    let qrcode = await QRCode.toDataURL(name);

    let events;
    let event_code = "",
      host_code = "";
    do {
      event_code = "";
      for (let i = 0; i < 5; i++) {
        event_code += getRandomInt(10);
      }
      events = await eventModel.getEventByEventCode(event_code);
    } while (events.length > 0);

    do {
      host_code = "";
      for (let i = 0; i < 5; i++) {
        host_code += getRandomInt(10);
      }
      events = await eventModel.getEventByHostCode(host_code);
    } while (events.length > 0);

    const event = await eventModel.createEvent(
      userId,
      event_code,
      host_code,
      name,
      link,
      qrcode,
      date
    );

    res.json({
      status: status.OK,
      event: event,
    });
  },

  async redeemEvent(req, res) {
    if (!has(req.body, ["event_id"])) {
      res.status(status.BAD_REQUEST).json();
      return;
    }

    const { event_id } = req.body;

    let events = await eventModel.redeemEvent(event_id);
    if (events.length > 0)
      res.json({
        event: events[0],
        status: status.OK,
      });
    else
      res.json({
        message: "Failed to redeem event",
        status: status.OK,
      });
    return;
  },

  async joinEvent(req, res) {
    // if (!has(req.body, ["wallet_address"])) {
    //   res.status(status.BAD_REQUEST).json();
    //   return;
    // }

    if (!has(req.body, ["event_code"]) && !has(req.body, ["host_code"])) {
      res.status(status.BAD_REQUEST).json();
      return;
    }

    const { event_code, host_code, wallet_address } = req.body;

    let events = await eventModel.getEventByEventCode(event_code);
    if (events.length === 0) {
      if (host_code === undefined) {
        res.json({
          event_code: "Event code is invalid",
          status: status.OK,
        });
        return;
      } else {
        events = await eventModel.getEventByHostCode(host_code);
        if (events.length === 0) {
          res.json({
            event_code: "Host code is invalid",
            status: status.OK,
          });
          return;
        }
      }
    }

    for (let i = 0; i < events.length; i++) {
      let event = events[i];
      let opensea_link = event.link;
      const holders = await nftHolderModel.getNFTHolder(
        wallet_address,
        opensea_link
      );

      if (holders.length === 0) {
        let holder_status = await verifyNFTHolder(wallet_address, opensea_link);
        if (holder_status) {
          await nftHolderModel.createNFTHolder(wallet_address, opensea_link, 1);
        } else {
          await nftHolderModel.createNFTHolder(wallet_address, opensea_link, 0);
        }
      }
    }

    res.json({
      event_code: "Code is OK",
      status: status.OK,
    });
  },

  async getAllEvents(req, res) {
    if (!has(req.body, ["wallet_address"])) {
      res.status(status.BAD_REQUEST).json();
      return;
    }
    const { wallet_address } = req.body;

    let new_events = [];

    const events = await eventModel.getAllEvents();
    for (let i = 0; i < events.length; i++) {
      let event = events[i];
      let new_event;
      let opensea_link = event.link;
      const holders = await nftHolderModel.getNFTHolder(
        wallet_address,
        opensea_link
      );

      if (holders.length === 0) {
        new_event = { ...event, verified: 0 };
      } else {
        let holder = holders[0];
        new_event = { ...event, verified: holder.holder_status };
      }

      new_events.push(new_event);
    }

    res.json({
      events: new_events,
      status: status.OK,
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

  async getEventById(req, res) {
    const { event_id } = req.body;
    let eventId = event_id;

    const event = await eventModel.getEventById(eventId);
    res.json({
      status: status.OK,
      event: event ?? null,
    });
  },
};
