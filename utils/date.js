const moment = require("moment");

function getCurrenDate() {
  return moment().format("YYYY-MM-DD");
}

module.exports = { getCurrenDate };
