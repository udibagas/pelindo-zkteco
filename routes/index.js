const router = require("express").Router();

router.use(require("./logs"));
router.use(require("./transactions"));
router.use("/api", require("./api"));

module.exports = router;
