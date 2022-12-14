const db = require('./database.js')

const users = {
  async create(user_id, phone, wallet_address, nft_holder) {
    const user = await this.getUser(phone)
    if (user?.id) return user

    let date = new Date()

    await db.query('INSERT INTO users(user_id, phone, wallet_address, nft_holder, date) VALUES(?, ?, ?, ?, ?)', [
      user_id,
      phone,
      wallet_address,
      nft_holder,
      date,
    ])
    return (await db.query('SELECT user_id, phone, wallet_address, date FROM users WHERE user_id = ?', [user_id]))[0]
  },

  async getUser(phone) {
    return (await db.query('SELECT user_id, phone, wallet_address FROM users WHERE phone = ?', [phone]))[0]
  },

  async deleteUser(user_id) {
    await db.query('DELETE FROM users WHERE user_id = ?', [user_id])
    await db.query('DELETE FROM events WHERE user_id = ?', [user_id])
    await db.query('DELETE FROM addresses WHERE user_id = ?', [user_id])
  },

  async getUserByPhone(phone) {
    return (
      await db.query(
        'SELECT users.*, addresses.wallet_address FROM users INNER JOIN addresses ON users.wallet_address = addresses.id WHERE users.phone = ?',
        [phone]
      )
    )[0]
  },

  async updateUser(phone, nft_holder) {
    await db.query('UPDATE users SET nft_holder = ? WHERE phone = ?', [nft_holder, phone])
    return (await db.query('SELECT user_id, phone, wallet_address FROM users WHERE phone = ?', [phone]))[0]
  },

  async updateUserAddress(user_id, address_id) {
    await db.query('UPDATE users SET wallet_address = ? WHERE user_id = ?', [address_id, user_id])

    return (
      await db.query(
        'SELECT users.*, addresses.wallet_address FROM users INNER JOIN addresses ON users.user_id = addresses.user_id WHERE users.user_id = ?',
        [user_id]
      )
    )[0]
  },

  async getUserAddress(user_id) {
    return (
      await db.query(
        'SELECT users.*, addresses.wallet_address FROM users INNER JOIN addresses ON users.wallet_address = addresses.id WHERE users.user_id = ?',
        [user_id]
      )
    )[0]
  },
}

module.exports = users
