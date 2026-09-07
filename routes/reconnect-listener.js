const router = require("express").Router();
const { connect } = require("../config/db");

router.post("/reconnect-listener", async (req, res) => {
  try {
    await connect();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

module.exports = router;
