const Model = require("../models");
const fs = require("fs");
const { default: axios } = require("axios");
const getSnapshot = require("./snapshot");

function sync() {
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

      // if (diff > 5_000) {
      //   console.log("Data is too old", lastData);
      //   return;
      // }

      console.log("New data found", lastData);
      const { API_URL, API_USER: username, API_PASS: password } = process.env;
      console.log("Sending data to API", API_URL);

      try {
        getSnapshot(lastData.ip_address, lastData.originalPhotopath);
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
}

module.exports = sync;
