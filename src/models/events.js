const db = require("./database.js");

const events = {
  async createEvent(user_id, code, name, link, date) {
    console.log(user_id, name, code, link, date);

    await db.query(
      "INSERT INTO events(user_id, code, name, link, date) VALUES(?, ?, ?, ?, ?)",
      [user_id, code, name, link, date]
    );
    return (
      await db.query(
        "SELECT user_id, code, name, link, date FROM events WHERE user_id = ? ORDER BY id desc LIMIT 1",
        [user_id]
      )
    )[0];
  },
};

module.exports = events;
