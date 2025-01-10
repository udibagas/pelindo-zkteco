class LogResult {
  constructor() {
    this.device_id = null;
    this.time = null;
    this.driver_id = null;
    this.drive_name = null;
    this.certificate_number = null;
    this.is_match = true;
    this.photopath = "";
  }

  static create({
    device_id,
    time,
    driver_id,
    driver_name,
    certificate_number,
    is_match,
    photopath,
  }) {
    return new LogResult({
      device_id,
      time,
      driver_id,
      driver_name,
      certificate_number,
      is_match,
      photopath,
    });
  }
}

module.exports = LogResult;
