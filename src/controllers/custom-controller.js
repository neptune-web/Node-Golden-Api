const status = require("http-status");

const axios = require("axios");

module.exports = {
  async verifyOwnership(req, res) {
    try {
      let { opensea_link, metamask_address } = req.body;

      let links = opensea_link.split("/");
      if (links.length < 3) return false;
      let link = links[links.length - 1];

      const options = {
        method: "GET",
        url: "https://api.opensea.io/api/v1/assets",
        params: {
          owner: metamask_address,
          collection_slug: link,
        },
        headers: {
          Accept: "application/json",
          "X-API-KEY": "2f6f419a083c46de9d83ce3dbe7db601",
        },
      };

      await axios
        .request(options)
        .then(function (response) {
          if (response.data.assets.length !== 0) {
            res.json({
              status: status.OK,
              message: "This address is verified.",
            });
          } else {
            res.json({
              status: status.OK,
              message: "This address is not verified.",
            });
          }
        })
        .catch(function (error) {
          res.json({
            status: error.code ? error.code : status.INTERNAL_SERVER_ERROR,
            message: "Please insert correct metamask address and opensea link.",
          });
        });
    } catch (err) {
      res.json({
        status: err.code ? err.code : status.INTERNAL_SERVER_ERROR,
        message: err.message,
      });
    }
  },
};
