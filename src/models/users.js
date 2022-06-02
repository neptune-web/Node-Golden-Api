const db = require("./database.js");
const { uuid } = require("uuidv4");

const users = {
  async create(user_id, phone, wallet_address) {
    const user = await this.getUser(phone);
    if (user?.id) return user;

    console.log(user_id, phone, wallet_address);

    await db.query(
      "INSERT INTO users(user_id, phone, wallet_address) VALUES(?, ?, ?)",
      [user_id, phone, wallet_address]
    );
    return (
      await db.query(
        "SELECT user_id, phone, wallet_address FROM users WHERE user_id = ?",
        [user_id]
      )
    )[0];
  },

  async getUser(phone) {
    return (
      await db.query(
        "SELECT user_id, phone, wallet_address FROM users WHERE phone = ?",
        [phone]
      )
    )[0];
  },
};

module.exports = users;
