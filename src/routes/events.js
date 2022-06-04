const express = require("express");
const router = express.Router();
const { checkToken } = require("../middlewares/authMiddleware");
const events = require("../controllers/events.js");

router.post("/api/events/joinEvent", events.joinEvent);
router.post("/api/events/createEvent", checkToken, events.createEvent);
router.post("/api/events/redeemEvent", checkToken, events.redeemEvent);
router.post("/api/events/getEvents", checkToken, events.getEvents);
router.post(
  "/api/events/getEventsByNFTHolder",
  checkToken,
  events.getEventsByNFTHolder
);
router.post("/api/events/getEventById", checkToken, events.getEventById);
router.post("/api/events/getAllEvents", checkToken, events.getAllEvents);

module.exports = router;
