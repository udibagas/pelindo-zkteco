class LogResult {
  constructor(
    device_id,
    time,
    driver_id,
    driver_name,
    certificate_number,
    is_match = true,
    photopath
  ) {
    this.device_id = device_id;
    this.time = time;
    this.driver_id = driver_id;
    this.driver_name = driver_name;
    this.certificate_number = certificate_number;
    this.is_match = is_match;
    this.photopath = photopath;
  }

  static create({
    device_id,
    time,
    driver_id,
    driver_name,
    certificate_number,
    is_match = true,
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
