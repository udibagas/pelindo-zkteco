const basicAuth = require("../middleware/auth");
const Model = require("../models");
const router = require("express").Router();

router.get("/camera", async (req, res) => {
  try {
    const data = await Model.getAlldevice();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/getLastData", basicAuth, async (req, res) => {
  const { dev_alias } = req.body;

  try {
    const lastData = await Model.getLastDataByDevice(dev_alias);
    res.status(200).json(lastData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/person", basicAuth, async (req, res) => {
  try {
    const personData = await Model.getPerson();
    res.status(200).json(personData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
