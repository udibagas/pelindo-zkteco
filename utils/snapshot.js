const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

function getSnapshot(ip_address, filepath) {
  const dir = filepath.split("/").slice(0, -1).join("/");
  fs.mkdirSync("." + dir, { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg(`rtsp://${ip_address}:8554/stream`)
      .inputOptions(["-rtsp_transport", "tcp"]) // Force TCP transport
      .outputOptions([
        "-vframes",
        "1", // Capture only 1 frame
        "-vcodec",
        "mjpeg", // Use MJPEG codec
        "-q:v",
        "2", // Set quality (1 = highest, 31 = lowest)
      ])
      .on("start", (commandLine) => {
        console.log("Running command:", commandLine);
      })
      .on("error", (err) => {
        reject(err);
      })
      .on("end", () => {
        resolve("Snapshot taken");
      })
      .save(`.${filepath}`); // tambahin titik biar gak absolute path
  });
}

module.exports = getSnapshot;
