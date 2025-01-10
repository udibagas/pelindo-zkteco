const moment = require("moment");

class LogResult {
  constructor(
    id,
    device_id,
    time,
    driver_id,
    driver_name,
    certificate_number,
    is_match = true,
    photopath
  ) {
    this.id = id;
    this.device_id = device_id;
    this.time = moment(time).format("YYYY-MM-DD HH:mm:ss");
    this.driver_id = driver_id;
    this.driver_name = driver_name;
    this.certificate_number = certificate_number;
    this.is_match = is_match;
    this.photopath = "http://10.130.0.219:8098" + photopath;
  }

  static create({
    id,
    device_id,
    time,
    driver_id,
    driver_name,
    certificate_number,
    is_match = true,
    photopath,
  }) {
    return new LogResult(
      id,
      device_id,
      time,
      driver_id,
      driver_name,
      certificate_number,
      is_match,
      photopath
    );
  }
}

module.exports = LogResult;
