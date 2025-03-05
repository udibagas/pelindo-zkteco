require("dotenv").config();
const fs = require("fs");

async function moveFile(localFilePath, remoteFilePath) {
  const dir = "/z/face/" + remoteFilePath.split("/").slice(0, -1).join("/");
  fs.mkdirSync(dir, { recursive: true });
  const data = await fs.promises.readFile(localFilePath);
  await fs.promises.writeFile(
    dir + "/" + remoteFilePath.split("/").pop(),
    data
  );
}

module.exports = { moveFile };
