require("dotenv").config();
const express = require("express");
const sync = require("./utils/sync");
const Model = require("./models");
const app = express();
app.set("view engine", "ejs");

const { proxy, scriptUrl } = require("rtsp-relay")(app);
app.use("/upload", express.static("upload"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.ws("/api/stream", (ws, req) => {
  const { ip_address } = req.query;
  const url = `rtsp://${ip_address}:8554/stream`;
  return proxy({ url })(ws);
});

app.get("/", async (req, res) => {
  const host = req.get("host");

  try {
    const cameras = await Model.getAlldevice();
    res.render("index", { scriptUrl, cameras, host });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.use(require("./routes"));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

sync();
