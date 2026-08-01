const router = require("express").Router();

router.use(require("./logs"));
router.use(require("./transactions"));
router.use("/api", require("./api"));

router.get("/test", (req, res) => {
  res.render("test");
});

module.exports = router;
