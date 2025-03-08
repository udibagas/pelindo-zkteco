const moment = require("moment");

class LogResult {
  constructor(
    id,
    device_id,
    time,
    driver_id,
    driver_name,
    photopath,
    certificate_number = "",
    is_match = true
  ) {
    this.id = id;
    this.device_id = device_id;
    this.time = moment(time).format("YYYY-MM-DD HH:mm:ss");
    this.driver_id = driver_id;
    this.driver_name = driver_name;
    this.photopath = this.generatePath(photopath);
    this.certificate_number = certificate_number;
    this.is_match = is_match;
  }

  generatePath(photopath) {
    return moment().format("/YYYY/MM/DD/") + photopath.split("/").pop();
  }

  static create({
    id,
    dev_alias: device_id,
    event_time: time,
    pin: driver_id,
    name: driver_name,
    vid_linkage_handle: photopath,
  }) {
    return new LogResult(
      id,
      device_id,
      time,
      driver_id,
      driver_name,
      photopath
    );
  }
}

module.exports = LogResult;
