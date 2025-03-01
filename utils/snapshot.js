const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const { moveFile } = require("./samba");

function getSnapshot(ip_address, filepath) {
  return new Promise((resolve, reject) => {
    try {
      const dir = filepath.split("/").slice(0, -1).join("/");
      fs.mkdirSync("./" + dir, { recursive: true });
    } catch (error) {
      return reject(error);
    }

    ffmpeg(`rtsp://${ip_address}:8554/stream`)
      .inputOptions(["-rtsp_transport", "tcp"]) // Force TCP transport
      .outputOptions(["-vframes", "1", "-vcodec", "mjpeg", "-q:v", "2"]) // 1 frame, mjpeg, quality 2
      .on("start", (cmd) => console.log("Running command:", cmd))
      .on("error", (err) => reject(err))
      .on("end", () => resolve("Snapshot taken"))
      .save(`.${filepath}`); // tambahin titik biar gak absolute path
  });
}

module.exports = getSnapshot;
