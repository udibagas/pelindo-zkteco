require("dotenv").config();
const SMB2 = require("smb2");
const fs = require("fs");

const { SMB_DIR, SMB_HOST, SMB_USER, SMB_PASS } = process.env;

const smbClient = new SMB2({
  share: `\\\\${SMB_HOST}\\${SMB_DIR}\\face`,
  domain: "WORKGROUP",
  username: SMB_USER,
  password: SMB_PASS,
});

function checkConnection() {
  return new Promise((resolve, reject) => {
    smbClient.readdir("", (err, files) => {
      if (err) {
        console.error(err);
        return reject(new Error("SMB client is not connected"));
      }
      console.log(files);
      resolve("SMB client is connected");
    });
  });
}

function moveFile(localFilePath, remoteFilePath) {
  console.log(`Moving file to shared folder`);
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

checkConnection()
  .then((r) => console.log(r))
  .catch((e) => console.error(e.message));

module.exports = { moveFile, createNestedDirs };
