const status = require("http-status");
const has = require("has-keys");

const eventModel = require("../models/events.js");
const nftHolderModel = require("../models/nft_holder.js");

var QRCode = require("qrcode");
const events = require("../models/events.js");

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

module.exports = {
  async createEvent(req, res) {
    const { user_id, name, link, date } = req.body;
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

    // const existEvents = await eventModel.existEvent(userId, name, link);

    // if (existEvents && existEvents.length > 0) {
    //   res.json({
    //     status: status.OK,
    //     exist_event: true,
    //     message: "Event is already created",
    //   });
    //   return;
    // }

    const event = await eventModel.createEvent(
      userId,
      event_code,
      host_code,
      name,
      link,
      qrcode,
      date
    );

    let new_event = { ...event };
    delete new_event["redeemed"];
    new_event["redeemed"] = event["redeemed"] === 1;

    res.json({
      status: status.OK,
      // exist_event: false,
      event: new_event,
    });
  },

  async redeemEvent(req, res) {
    if (!has(req.body, ["event_id"])) {
      res.json({
        message: "event_id is undefined",
        status: status.OK,
      });
      return;
    }

    if (!has(req.body, ["wallet_address"])) {
      res.json({
        message: "wallet_address is undefined",
        status: status.OK,
      });
      return;
    }

    const { wallet_address, event_id } = req.body;

    let redeem_status = await eventModel.isRedeemedEvent(
      wallet_address,
      event_id
    );
    if (redeem_status) {
      res.json({
        redeemed: false,
        message: "Event is already redeemed",
        status: status.OK,
      });
      return;
    }

    let joined_events = await eventModel.getJoinedEventByAddress(
      wallet_address,
      event_id
    );
    if (joined_events.length === 0) {
      res.json({
        redeemed: false,
        message: "Failed to redeem event.",
        status: status.OK,
      });
      return;
    }

    let events = await eventModel.redeemEvent(wallet_address, event_id);
    if (!events) {
      res.json({
        redeemed: false,
        message: "Failed to redeem event",
        status: status.OK,
      });
      return;
    }

    let event = events[0];

    let new_event = { ...event };
    delete new_event["redeemed"];
    new_event["redeemed"] = true;

    if (events.length > 0)
      res.json({
        redeemed: true,
        event: new_event,
        status: status.OK,
      });
    else
      res.json({
        redeemed: false,
        message: "Failed to redeem event",
        status: status.OK,
      });
    return;
  },

  async joinEvent(req, res) {
    if (!has(req.body, ["user_id"])) {
      res.json({
        event_code: "user_id parameter is undefined",
        status: status.BAD_REQUEST,
      });
      return;
    }

    if (!has(req.body, ["event_code"]) && !has(req.body, ["host_code"])) {
      res.status(status.BAD_REQUEST).json();
      return;
    }

    const { user_id, event_code, host_code, wallet_address } = req.body;

    let events = await eventModel.getEventByEventCode(event_code, host_code);

    if (events.length === 0) {
      res.json({
        event_code: "The code is wrong or Event is not exist.",
        joined: false,
        status: status.OK,
      });
      return;
    }

    let event = events[0];

    let joinedEvent = await eventModel.getJoinedEvent(user_id, event.id);
    if (joinedEvent.length > 0) {
      res.json({
        event_code: "Already joined the event",
        joined: false,
        status: status.OK,
      });
      return;
    }
    await eventModel.joinEvent(user_id, event.id);

    for (let i = 0; i < events.length; i++) {
      let event = events[i];
      let opensea_link = event.link;
      const holders = await nftHolderModel.getNFTHolder(
        wallet_address,
        opensea_link
      );

      if (holders.length === 0) {
        let holder_status = await nftHolderModel.verifyNFTHolder(
          wallet_address,
          opensea_link
        );
        if (holder_status) {
          await nftHolderModel.createNFTHolder(wallet_address, opensea_link, 1);
        } else {
          await nftHolderModel.createNFTHolder(wallet_address, opensea_link, 0);
        }
      }
    }

    res.json({
      event_code: "Event joined successfully",
      joined: true,
      status: status.OK,
    });
  },

  async getAllEvents(req, res) {
    if (!has(req.body, ["user_id"])) {
      res.json({
        message: "user_id is undefined",
        status: status.BAD_REQUEST,
      });
      return;
    }

    if (!has(req.body, ["wallet_address"])) {
      res.json({
        message: "wallet_address is undefined",
        status: status.BAD_REQUEST,
      });
      return;
    }

    const { user_id, wallet_address } = req.body;

    let new_events = [];

    const holder_events = await eventModel.getEventsByNFTHolder(user_id);
    const host_events = await eventModel.getEvents(user_id);

    let events = [...holder_events, ...host_events];

    for (let i = 0; i < events.length; i++) {
      let event = events[i];
      let new_event;
      let opensea_link = event.link;
      const holders = await nftHolderModel.getNFTHolder(
        wallet_address,
        opensea_link
      );
      console.log(opensea_link, holders);
      if (holders.length === 0) {
        new_event = { ...event, verified: false };
      } else {
        let holder = holders[0];
        new_event = { ...event, verified: holder.holder_status === 1 };
      }

      let redeems = await eventModel.getRedeemEvents(event.id, wallet_address);

      delete event["redeemed"];
      if (redeems.length > 0) new_event["redeemed"] = true;
      else new_event["redeemed"] = false;

      if (event.user_id === user_id) {
        new_event["joined"] = false;
      } else {
        new_event["joined"] = true;
      }
      new_events.push(new_event);
    }

    res.json({
      events: new_events,
      status: status.OK,
    });
  },

  async getEventById(req, res) {
    const { event_id } = req.body;
    let eventId = event_id;

    const event = await eventModel.getEventById(eventId);
    let new_event = { ...event };
    delete new_event["redeemed"];
    new_event["redeemed"] = event["redeemed"] === 1;

    res.json({
      status: status.OK,
      event: new_event ?? null,
    });
  },

  async getAllAddressForRedeemedEvent(req, res) {
    if (!has(req.body, ["event_id"])) {
      res.json({
        message: "event_id is undefined",
        status: status.BAD_REQUEST,
      });
      return;
    }
    const { event_id } = req.body;

    const addresses = await eventModel.getAllAddressForRedeemedEvent(event_id);

    let wallet_addresses = [];
    for (let i = 0; i < addresses.length; i++) {
      let address = addresses[i];
      const { wallet_address, link } = address;
      let nft_holder = await nftHolderModel.getNFTHolder(wallet_address, link);
      let verified = false;
      if (nft_holder.length > 0) {
        verified = true;
      }
      wallet_addresses.push({ wallet_address, verified });
    }

    res.json({
      status: status.OK,
      addresses: wallet_addresses,
    });
  },
};
