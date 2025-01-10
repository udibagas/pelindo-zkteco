const { Service } = require("node-windows");
const svc = new Service({
  name: "ZKTeco App",
  description: "ZKTeco app as a Windows service.",
  script: "C:\\apps\\pelindo-zkteco\\app.js",
});

svc.on("install", () => {
  svc.start();
});

svc.install();
