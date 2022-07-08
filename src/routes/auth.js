const express = require("express");
const router = express.Router();
const { validate } = require("express-validation");

const auth = require("../controllers/auth.js");

const authValidator = require("../validators/auth-validator");
const {
  checkToken,
  validateAuthToken,
} = require("../middlewares/authMiddleware");

router.post("/api/auth/login", auth.logIn);
router.post("/api/auth/logInWithWeb", auth.logInWithWeb);
router.post(
  "/api/auth/verifyOPT",
  validate(authValidator.verifyOPT, {}, {}),
  auth.verifyOPT
);
router.post("/api/auth/verifyOPTWithWeb", auth.verifyOPTWithWeb);
router.post(
  "/api/auth/signUp",
  validate(authValidator.signUp, {}, {}),
  auth.signUp
);
router.post(
  "/api/auth/registerWallet",
  validate(authValidator.registerWallet, {}, {}),
  auth.registerWallet
);
router.post(
  "/api/auth/verifyWalletAddress",
  checkToken,
  auth.verifyWalletAddress
);
router.post("/api/auth/validateAuthToken", validateAuthToken);

router.post("/api/auth/getUserByPhone", auth.getUserByPhone);

module.exports = router;
