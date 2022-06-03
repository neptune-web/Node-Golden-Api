const db = require("./database.js");

const events = {
  async createEvent(user_id, event_code, host_code, name, link, qrcode, date) {
    await db.query(
      "INSERT INTO events(user_id, event_code, host_code, name, link, qrcode, date) VALUES(?, ?, ?, ?, ?, ?, ?)",
      [user_id, event_code, host_code, name, link, qrcode, date]
    );
    return (
      await db.query(
        "SELECT user_id, event_code, host_code, name, link, qrcode, date FROM events WHERE user_id = ? ORDER BY id desc LIMIT 1",
        [user_id]
      )
    )[0];
  },

  async getEvents(user_id) {
    return await db.query(
      "SELECT id, user_id, name, link, qrcode, date, redeemed FROM events WHERE user_id = ?",
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
    return (
      await db.query(
        "SELECT id, user_id, name, link, qrcode, date, redeemed FROM events WHERE id = ?",
        [event_id]
      )
    )[0];
  },

  async getEventByEventCode(event_code) {
    return await db.query(
      "SELECT id, user_id, name, link, qrcode, date, redeemed FROM events WHERE event_code = ?",
      [event_code]
    );
  },

  async getEventByHostCode(host_code) {
    return await db.query(
      "SELECT id, user_id, name, link, qrcode, date, redeemed FROM events WHERE host_code = ?",
      [host_code]
    );
  },

  async redeemEvent(event_id) {
    console.log(event_id);
    await db.query("UPDATE events SET redeemed = 1 WHERE id = ?", [event_id]);
    return await db.query("SELECT * FROM events WHERE id = ?", [event_id]);
  },
};

module.exports = events;
