const SMB2 = require("smb2");
const fs = require("fs");

const smbClient = new SMB2({
  share: `\\\\${process.env.SMB_HOST}\\${process.env.SMB_DIR}`,
  domain: "WORKGROUP",
  username: process.env.SMB_USER,
  password: process.env.SMB_PASS,
});

function moveFile(localFilePath, remoteFilePath, cb) {
  fs.readFile(localFilePath, (err, data) => {
    if (err) return cb(err);

    try {
      createNestedDirs(remoteFilePath);
    } catch (error) {
      return cb(error);
    }

    smbClient.writeFile(remoteFilePath, data, (err) => {
      if (err) return cb(err);
      cb(null);
    });
  });
}

function createNestedDirs(path, index = 0, basePath = "") {
  const pathSegments = path.split("/");
  if (index >= pathSegments.length) return;

  const currentPath = basePath
    ? `${basePath}/${pathSegments[index]}`
    : pathSegments[index];

  smbClient.mkdir(currentPath, (err) => {
    if (err && err.code !== "STATUS_OBJECT_NAME_COLLISION") {
      throw err;
    } else {
      console.log(`Created or already exists: ${currentPath}`);
      createNestedDirs(pathSegments, index + 1, currentPath);
    }
  });
}

module.exports = { moveFile, createNestedDirs };
