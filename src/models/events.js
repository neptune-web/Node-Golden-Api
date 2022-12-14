const db = require("./database.js");

const events = {
  async createEvent(user_id, event_code, host_code, name, link, qrcode, date) {
    let dateTime = new Date();
    await db.query(
      "INSERT INTO events(user_id, event_code, host_code, name, link, qrcode, date, dateTime) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
      [user_id, event_code, host_code, name, link, qrcode, date, dateTime]
    );
    return (
      await db.query(
        "SELECT user_id, event_code, host_code, name, link, qrcode, date FROM events WHERE user_id = ? ORDER BY id desc LIMIT 1",
        [user_id]
      )
    )[0];
  },

  async existEvent(user_id, name, link) {
    return await db.query(
      "SELECT * FROM events WHERE user_id = ? AND name = ? AND link = ? ORDER BY id desc",
      [user_id, name, link]
    );
  },

  async getEvents(user_id) {
    return await db.query(
      "SELECT * FROM events WHERE user_id = ? ORDER BY id desc",
      [user_id]
    );
  },

  async getAllEvents() {
    return await db.query(
      "SELECT id, user_id, name, event_code, host_code, link, qrcode, date, redeemed FROM events",
      []
    );
  },

  async getEventById(event_id) {
    return (await db.query("SELECT * FROM events WHERE id = ?", [event_id]))[0];
  },

  async getEventByEventCode(event_code, host_code) {
    if (host_code !== undefined) {
      return await db.query(
        "SELECT * FROM events WHERE event_code = ? AND host_code = ?",
        [event_code, host_code]
      );
    }
    return await db.query("SELECT * FROM events WHERE event_code = ?", [
      event_code,
    ]);
  },

  async getEventsByUserId(user_id) {
    return await db.query("SELECT * FROM events WHERE user_id = ?", [user_id]);
  },

  async getEventByHostCode(host_code) {
    return await db.query("SELECT * FROM events WHERE host_code = ?", [
      host_code,
    ]);
  },

  async getRedeemEvents(event_id, wallet_address) {
    let wallet = (
      await db.query("SELECT * FROM addresses WHERE wallet_address = ?", [
        wallet_address,
      ])
    )[0];

    if (wallet) {
      return await db.query(
        "SELECT * FROM redeem_event WHERE event_id = ? AND wallet_address = ?",
        [event_id, wallet.id]
      );
    } else {
      return [];
    }
  },

  async isRedeemedEvent(wallet_address, event_id) {
    let wallet = (
      await db.query("SELECT * FROM addresses WHERE wallet_address = ?", [
        wallet_address,
      ])
    )[0];

    if (wallet) {
      let redeem_events = await db.query(
        "SELECT * FROM redeem_event WHERE event_id = ? AND wallet_address = ?",
        [event_id, wallet.id]
      );
      if (redeem_events.length > 0) return true;
      else return false;
    } else return false;
  },

  async getJoinedEventByAddress(wallet_address, event_id) {
    return await db.query(
      "SELECT joined_event.* FROM joined_event INNER JOIN addresses ON joined_event.user_id = addresses.user_id WHERE addresses.wallet_address = ? AND joined_event.event_id = ?",
      [wallet_address, event_id]
    );
  },

  async redeemEvent(wallet_address, event_id) {
    let wallet = (
      await db.query("SELECT * FROM addresses WHERE wallet_address = ?", [
        wallet_address,
      ])
    )[0];

    if (wallet) {
      let redeem_events = await db.query(
        "SELECT * FROM redeem_event WHERE event_id = ? AND wallet_address = ?",
        [event_id, wallet.id]
      );
      if (redeem_events.length === 0)
        await db.query(
          "INSERT INTO redeem_event(wallet_address, event_id) VALUES(?, ?)",
          [wallet.id, event_id]
        );
      return await db.query("SELECT * FROM events WHERE id = ?", [event_id]);
    }
    return null;
  },

  async joinEvent(user_id, event_id) {
    let events = await db.query(
      "SELECT * FROM joined_event WHERE user_id = ? AND event_id = ?",
      [user_id, event_id]
    );
    if (events.length === 0) {
      await db.query(
        "INSERT INTO joined_event(user_id, event_id) VALUES(?, ?)",
        [user_id, event_id]
      );
    }
  },

  async getJoinedEvent(user_id, event_id) {
    return await db.query(
      "SELECT * FROM joined_event WHERE user_id = ? AND event_id = ?",
      [user_id, event_id]
    );
  },

  async getEventsByNFTHolder(user_id) {
    return await db.query(
      "SELECT `events`.* FROM joined_event INNER JOIN `events` ON joined_event.event_id = `events`.id WHERE joined_event.user_id = ? ORDER By `events`.id DESC",
      [user_id, user_id]
    );
  },

  async getAllAddressForRedeemedEvent(event_id) {
    return await db.query(
      "SELECT joined_event.*, addresses.wallet_address, `events`.link FROM joined_event INNER JOIN users ON users.user_id = joined_event.user_id INNER JOIN addresses ON users.wallet_address = addresses.id INNER JOIN `events` ON `events`.id = ? WHERE joined_event.event_id = ?",
      [event_id, event_id]
    );
  },
};

module.exports = events;
