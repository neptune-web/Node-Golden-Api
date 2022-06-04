const db = require("./database.js");

const addresses = {
  async createAddress(user_id, wallet_address) {
    await db.query(
      "INSERT INTO addresses(user_id, wallet_address) VALUES(?, ?)",
      [user_id, wallet_address]
    );
    return (
      await db.query(
        "SELECT * FROM addresses WHERE user_id = ? AND wallet_address = ?",
        [user_id, wallet_address]
      )
    )[0];
  },

  async getAddress(user_id, wallet_address) {
    return (
      await db.query(
        "SELECT * FROM addresses WHERE user_id = ? AND wallet_address = ?",
        [user_id, wallet_address]
      )
    )[0];
  },

  async getAddresses(user_id) {
    return await db.query("SELECT * FROM addresses WHERE user_id = ?", [
      user_id,
    ]);
  },
};

module.exports = addresses;
