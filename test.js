require("dotenv").config();

const moveFile = require("./utils/ftp");

moveFile("./a.txt", "a.txt")
  .then((r) => console.log(r))
  .catch((e) => console.error(e.message));
