const router = require("express").Router();
const { connect, client } = require("../config/db");

router.post("/reconnect-listener", async (req, res) => {
  try {
    await connect();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

router.get("/listener-status", async (req, res) => {
  try {
    res.json({ success: client ? true : false });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

module.exports = router;
