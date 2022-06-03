const db = require("./database.js");

const events = {
  async createVerification(phone, code) {
    await db.query("DELETE from verification WHERE phone=?", [phone]);

    await db.query("INSERT INTO verification(phone, code) VALUES(?, ?)", [
      phone,
      code,
    ]);
  },

  async getVerificationCode(phone) {
    let data = (
      await db.query("SELECT code FROM verification WHERE phone = ?", [phone])
    )[0];

    if (data) {
      //await db.query("DELETE from verification WHERE phone=?", [phone]);
      return data.code;
    } else {
      return "0";
    }
  },
};

module.exports = events;
