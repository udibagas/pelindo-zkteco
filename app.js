const express = require("express");
const Model = require("./models");
const { default: axios } = require("axios");
const app = express();

app.get("/", (req, res) => {
  res.send("What's up!");
});

app.get("/api/getLastData", async (req, res) => {
  const lastData = await Model.getLasTransaction();
  res.status(200).json(lastData);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

setInterval(async () => {
  const lastData = await Model.getLasTransaction();
  axios.post("http://localhost:3000/api/getLastData", lastData);
}, 200);
