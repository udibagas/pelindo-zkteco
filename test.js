require("dotenv").config();

const moveFile = require("./utils/ftp");

moveFile("./test.js", "/a/b/c/test.js")
  .then((r) => console.log(r))
  .catch((e) => console.error(e.message));
