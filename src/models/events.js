const db = require("./database.js");

const events = {
  async createEvent(user_id, code, name, link, qrcode, date) {
    console.log(user_id, name, code, link, date);

    await db.query(
      "INSERT INTO events(user_id, code, name, link, qrcode, date) VALUES(?, ?, ?, ?, ?, ?)",
      [user_id, code, name, link, qrcode, date]
    );
    return (
      await db.query(
        "SELECT user_id, code, name, link, qrcode, date FROM events WHERE user_id = ? ORDER BY id desc LIMIT 1",
        [user_id]
      )
    )[0];
  },

  async getEvents(user_id) {
    return await db.query(
      "SELECT user_id, code, name, link, date FROM events WHERE user_id = ?",
      [user_id]
    );
  },
};

module.exports = events;
