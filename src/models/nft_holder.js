const db = require('./database.js')
const axios = require('axios')

const nft_holders = {
  async verifyNFTHolder(wallet_address, opensea_link) {
    let links = opensea_link.split('/')
    if (links.length < 3) return false

    let asset_link_include = false
    let asset_address = ''
    let asset_id = ''
    for (let i = 0; i < links.length; i++) {
      let link = links[i]
      if (link === 'assets') {
        asset_link_include = true
        asset_address = links[i + 2]
        if (links.length == i + 4) {
          asset_id = links[i + 3]
        }
        break
      }
    }
    let opeansea_params = {
      owner: wallet_address,
    }
    if (asset_link_include) {
      opeansea_params = {
        ...opeansea_params,
        asset_contract_address: asset_address,
      }
      if (asset_id.length > 0) {
        opeansea_params = { ...opeansea_params, token_ids: asset_id }
      }
    } else {
      let collection_link = links[links.length - 1]
      opeansea_params = {
        ...opeansea_params,
        collection_slug: collection_link,
      }
    }

    const options = {
      method: 'GET',
      url: 'https://api.opensea.io/api/v1/assets',
      params: opeansea_params,
      headers: {
        'X-API-KEY': '2f6f419a083c46de9d83ce3dbe7db601',
      },
    }
    const response = await axios.request(options)

    return response.data.assets.length > 0
  },

  async createNFTHolder(wallet_address, opensea_link, holder_status) {
    await db.query('INSERT INTO nft_holder(wallet_address, opensea_link, holder_status) VALUES(?, ?, ?)', [
      wallet_address,
      opensea_link,
      holder_status,
    ])

    return (
      await db.query(
        'SELECT wallet_address, opensea_link, holder_status FROM nft_holder WHERE wallet_address = ? AND opensea_link = ?',
        [wallet_address, opensea_link]
      )
    )[0]
  },

  async updateNFTHolder(wallet_address, opensea_link, holder_status) {
    await db.query('UPDATE nft_holder SET holder_status = ? WHERE wallet_address = ? AND opensea_link = ?', [
      holder_status,
      wallet_address,
      opensea_link,
    ])

    return (
      await db.query(
        'SELECT wallet_address, opensea_link, holder_status FROM nft_holder WHERE wallet_address = ? AND opensea_link = ?',
        [wallet_address, opensea_link]
      )
    )[0]
  },

  async getNFTHolder(wallet_address, opensea_link) {
    return await db.query('SELECT * FROM nft_holder WHERE wallet_address = ? AND opensea_link = ?', [
      wallet_address,
      opensea_link,
    ])
  },
}

module.exports = nft_holders
