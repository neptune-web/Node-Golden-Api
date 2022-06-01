const express = require("express");
const router = express.Router();
const { validate } = require("express-validation");

const customerController = require("../controllers/custom-controller");
const customerValidator = require("../validators/custom-validator");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/api/verifyOwnership",
  validate(customerValidator.verifyOwnership, {}, {}),
  customerController.verifyOwnership
);

module.exports = router;
