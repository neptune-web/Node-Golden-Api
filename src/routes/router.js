const router = require("express").Router();

router.use(require("./customer-route"));
router.use(require("./auth"));

module.exports = router;
