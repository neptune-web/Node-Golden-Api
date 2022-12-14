const express = require("express");
const router = express.Router();
const { checkToken } = require("../middlewares/authMiddleware");
const address = require("../controllers/address.js");

router.post("/api/address/getAddresses", checkToken, address.getAddresses);
router.post(
  "/api/address/addWalletAddress",
  checkToken,
  address.addWalletAddress
);
router.post(
  "/api/address/addWalletAddressByPhone",
  address.addWalletAddressByPhone
);
router.post(
  "/api/address/deleteWalletAddress",
  checkToken,
  address.deleteWalletAddress
);
router.post(
  "/api/address/getAllWalletAddress",
  checkToken,
  address.getAllWalletAddress
);

router.post("/api/address/selectAddress", checkToken, address.selectAddress);
module.exports = router;
