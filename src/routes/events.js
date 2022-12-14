const express = require("express");
const router = express.Router();
const { checkToken } = require("../middlewares/authMiddleware");
const events = require("../controllers/events.js");

router.post("/api/events/joinEvent", checkToken, events.joinEvent);
router.post("/api/events/createEvent", checkToken, events.createEvent);
router.post("/api/events/redeemEvent", checkToken, events.redeemEvent);
router.post("/api/events/getEventById", checkToken, events.getEventById);
router.post("/api/events/getAllEvents", checkToken, events.getAllEvents);
router.post(
  "/api/events/getAllAddressForRedeemedEvent",
  checkToken,
  events.getAllAddressForRedeemedEvent
);

module.exports = router;
