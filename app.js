require("dotenv").config();
const express = require("express");
const fs = require("fs");
const Model = require("./models");
const { default: axios } = require("axios");
const basicAuth = require("./middleware/auth");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("What's up!");
});

app.post("/api/getLastData", basicAuth, async (req, res) => {
  const { dev_alias } = req.body;
  const lastData = await Model.getLastDataByDevice(dev_alias);
  res.status(200).json(lastData);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

fs.readFile("./lastId.txt", "utf-8", (err, lastId) => {
  if (err) {
    console.error("Error reading lastId.txt", err);
    return;
  }

  setInterval(async () => {
    const lastData = await Model.getLastTransaction();

    if (lastData === null) {
      return;
    }

    if (lastId === lastData.id) {
      return;
    }

    // kalau waktu terakhir jeda lebih dari 5 detik return
    const now = new Date().getTime();
    const lastTime = new Date(lastData.time).getTime();
    const diff = now - lastTime;
    // console.log(diff, lastTime, now);

    // if (diff > 5_000_000) {
    //   // console.log("Data is too old", lastData);
    //   return;
    // }

    console.log("New data found", lastData);
    const { API_URL, API_USER: username, API_PASS: password } = process.env;
    console.log("Sending data to API", API_URL);

    try {
      const res = await axios.post(API_URL, lastData, {
        auth: { username, password },
      });
      console.log("Data sent to API", res.data);
      lastId = lastData.id;
      await fs.promises.writeFile("./lastId.txt", lastId);
    } catch (error) {
      console.error("Error sending data to API", error);
    }
  }, +process.env.POLL_INTERVAL);
});
