const SMB2 = require("smb2");
const fs = require("fs");

const smbClient = new SMB2({
  share: `\\\\${process.env.SMB_HOST}\\${process.env.SMB_DIR}`,
  domain: "WORKGROUP",
  username: process.env.SMB_USER,
  password: process.env.SMB_PASS,
});

function moveFile(localFilePath, remoteFilePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(localFilePath, (err, data) => {
      if (err) return reject(err);

      try {
        createNestedDirs(remoteFilePath.split("/").slice(0, -1).join("/"));
      } catch (error) {
        return reject(error);
      }

      smbClient.writeFile(remoteFilePath, data, (err) => {
        if (err) return reject(err);

        // remove local file after moved
        try {
          fs.unlinkSync(localFilePath);
        } catch (error) {
          // log error but don't reject
          console.error(error.message);
        }

        resolve("File moved successfully");
      });
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
      // console.log(`Created or already exists: ${currentPath}`);
      createNestedDirs(pathSegments, index + 1, currentPath);
    }
  });
}

module.exports = { moveFile, createNestedDirs };
