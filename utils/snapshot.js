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
        moveFile(`./${filepath}`, filepath, (err) => {
          if (err) return reject(err);

          // uncomment if ok
          // try {
          //   fs.unlinkSync(`./${filepath}`);
          // } catch (error) {
          //   console.error("Error deleting file", error);
          // }

          resolve("Snapshot taken");
        });
      })
      .save(`.${filepath}`); // tambahin titik biar gak absolute path
  });
}

module.exports = getSnapshot;
