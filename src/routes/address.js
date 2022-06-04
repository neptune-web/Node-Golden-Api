const express = require("express");
const router = express.Router();
const { checkToken } = require("../middlewares/authMiddleware");
const address = require("../controllers/address.js");

router.post("/api/address/getAddresses", checkToken, address.getAddresses);

module.exports = router;
