const { Client } = require("basic-ftp");
const { unlink, write } = require("fs");
const stream = require("stream");

const ftpConfig = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASS,
  secure: true,
  secureOptions: {
    rejectUnauthorized: false,
  },
};

async function moveFile(localFilePath, remoteFilePath) {
  const path = remoteFilePath.split("/").slice(0, -1).join("/");
  const filename = remoteFilePath.split("/").pop();
  const client = new Client();

  client.ftp.verbose = false;

  try {
    await client.access(ftpConfig);
    await client.ensureDir(process.env.FTP_DIR + "/" + path);
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

async function getImage(filename) {
  try {
    const client = new Client();
    await client.access(ftpConfig);

    // Download to buffer
    let fileBuffer = Buffer.alloc(0);
    const writeStream = new stream.Writable({
      write(chunk, encoding, callback) {
        fileBuffer = Buffer.concat([fileBuffer, chunk]);
        callback();
      },
    });

    await client.downloadTo(writeStream, process.env.FTP_DIR + "/" + filename);
    client.close();

    // Convert to Base64
    const base64Data = fileBuffer.toString("base64");
    const ext = filename.split(".").pop().toLowerCase();
    const mimeType = getMimeType(ext);
    return `data:${mimeType};base64,${base64Data}`;
  } catch (err) {
    console.error(err.message);
    return "/avatar.png";
  }
}

module.exports = { moveFile, getImage };
