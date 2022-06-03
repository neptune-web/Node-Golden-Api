const db = require("./database.js");
const { uuid } = require("uuidv4");

const users = {
  async create(user_id, phone, wallet_address, nft_holder) {
    const user = await this.getUser(phone);
    if (user?.id) return user;

    console.log(user_id, phone, wallet_address, nft_holder);

    await db.query(
      "INSERT INTO users(user_id, phone, wallet_address, nft_holder) VALUES(?, ?, ?, ?)",
      [user_id, phone, wallet_address, nft_holder]
    );
    return (
      await db.query(
        "SELECT user_id, phone, wallet_address, nft_holder FROM users WHERE user_id = ?",
        [user_id]
      )
    )[0];
  },

  async getUser(phone) {
    return (
      await db.query(
        "SELECT user_id, phone, wallet_address, nft_holder FROM users WHERE phone = ?",
        [phone]
      )
    )[0];
  },

  async updateUser(phone, nft_holder) {
    await db.query("UPDATE users SET nft_hoder = ? WHERE phone = ?", [
      nft_holder,
      phone,
    ]);
    return (
      await db.query(
        "SELECT user_id, phone, wallet_address, nft_holder FROM users WHERE phone = ?",
        [phone]
      )
    )[0];
  },
};

module.exports = users;
