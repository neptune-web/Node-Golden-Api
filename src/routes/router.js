const router = require("express").Router();

router.use(require("./customer-route"));
router.use(require("./auth"));
router.use(require("./events"));

module.exports = router;
