const db = require("./database.js");

const nft_holders = {
  async createNFTHolder(wallet_address, opensea_link, holder_status) {
    await db.query(
      "INSERT INTO nft_holder(wallet_address, opensea_link, holder_status) VALUES(?, ?, ?)",
      [wallet_address, opensea_link, holder_status]
    );

    return (
      await db.query(
        "SELECT wallet_address, opensea_link, holder_status FROM nft_holder WHERE wallet_address = ? AND opensea_link = ?",
        [wallet_address, opensea_link]
      )
    )[0];
  },

  async updateNFTHolder(wallet_address, opensea_link, holder_status) {
    await db.query(
      "UPDATE nft_holder SET holder_status = ? WHERE wallet_address = ? AND opensea_link = ?",
      [holder_status, wallet_address, opensea_link]
    );

    return (
      await db.query(
        "SELECT wallet_address, opensea_link, holder_status FROM nft_holder WHERE wallet_address = ? AND opensea_link = ?",
        [wallet_address, opensea_link]
      )
    )[0];
  },

  async getNFTHolder(wallet_address, opensea_link) {
    return await db.query(
      "SELECT * FROM nft_holder WHERE wallet_address = ? AND opensea_link = ?",
      [wallet_address, opensea_link]
    );
  },
};

module.exports = nft_holders;
