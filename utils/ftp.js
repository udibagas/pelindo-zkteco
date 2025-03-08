const { Client } = require("basic-ftp");
const { unlink } = require("fs");

async function moveFile(localFilePath, remoteFilePath) {
  const path = remoteFilePath.split("/").slice(0, -1).join("/");
  const filename = remoteFilePath.split("/").pop();
  const client = new Client();

  client.ftp.verbose = false;

  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS,
    });

    await client.ensureDir(path);
    await client.uploadFrom(localFilePath, filename);

    // delete local file
    unlink(localFilePath, (err) => {
      if (err) console.error(err.message);
    });

    return "File has been moved";
  } catch (err) {
    throw err;
  } finally {
    client.close();
  }
}

module.exports = moveFile;
