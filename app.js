require("dotenv").config();
const express = require("express");
const Model = require("./models");
const { default: axios } = require("axios");
const app = express();

app.get("/", (req, res) => {
  res.send("What's up!");
});

app.get("/api/getLastData", async (req, res) => {
  const lastData = await Model.getLastTransaction();
  res.status(200).json(lastData);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

let lastId = null;

setInterval(async () => {
  const lastData = await Model.getLastTransaction();

  if (lastData === null) {
    return;
  }

  lastId = lastData.id;

  if (lastId === lastData.id) {
    return;
  }

  console.log(lastData);

  const { API_URL, API_USER: username, API_PASS: password } = process.env;
  try {
    const res = await axios.post(API_URL, lastData, {
      auth: { username, password },
    });
    console.log("Data sent to API", res.data);
  } catch (error) {
    console.error("Error sending data to API", error);
  }
}, +process.env.POLL_INTERVAL);
