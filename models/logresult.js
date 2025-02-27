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
    photopath,
    ip_address
  ) {
    this.id = id;
    this.device_id = device_id;
    this.time = moment(time).format("YYYY-MM-DD HH:mm:ss");
    this.driver_id = driver_id;
    this.driver_name = driver_name;
    this.certificate_number = certificate_number;
    this.is_match = is_match;
    this.originalPhotopath = photopath;
    this.ip_address = ip_address;
    this.photopath = "http://10.130.0.219:3000" + photopath;
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
    ip_address,
  }) {
    return new LogResult(
      id,
      device_id,
      time,
      driver_id,
      driver_name,
      certificate_number,
      is_match,
      photopath,
      ip_address
    );
  }
}

module.exports = LogResult;
