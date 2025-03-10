require("dotenv").config();

const moveFile = require("./utils/ftp");

moveFile("./test.jpg", "test.jpg")
  .then((r) => console.log(r))
  .catch((e) => console.error(e.message));
