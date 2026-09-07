const router = require("express").Router();

router.use(require("./logs"));
router.use(require("./transactions"));
router.use(require("./reconnect-listener"));
router.use("/api", require("./api"));

module.exports = router;
