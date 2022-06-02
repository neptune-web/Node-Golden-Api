const express = require("express");
const router = express.Router();
const { validate } = require("express-validation");

const auth = require("../controllers/auth.js");
const authValidator = require("../validators/auth-validator");

router.post("/api/auth/login", auth.logIn);
router.post(
  "/api/auth/verifyOPT",
  validate(authValidator.verifyOPT, {}, {}),
  auth.verifyOPT
);
router.post(
  "/api/auth/signUp",
  validate(authValidator.signUp, {}, {}),
  auth.signUp
);

module.exports = router;
