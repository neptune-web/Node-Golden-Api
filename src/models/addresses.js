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

  async selectAddress(user_id, wallet_address) {
    let address = (
      await db.query(
        "SELECT * FROM addresses WHERE user_id = ? AND wallet_address = ?",
        [user_id, wallet_address]
      )
    )[0];
    await db.query("UPDATE users SET wallet_address = ? WHERE user_id = ?", [
      address.id,
      user_id,
    ]);
    console.log(user_id);

    return (
      await db.query(
        "SELECT users.*, addresses.wallet_address FROM users INNER JOIN addresses ON users.wallet_address = addresses.id WHERE users.user_id = ?",
        [user_id]
      )
    )[0];
  },

  async deleteAddress(user_id, wallet_address) {
    await db.query(
      "DELETE FROM addresses WHERE user_id = ? AND wallet_address = ?",
      [user_id, wallet_address]
    );
  },
};

module.exports = addresses;
