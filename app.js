require("dotenv").config();
const express = require("express");
const Model = require("./models");
const logger = require("./logger");
const app = express();
app.set("view engine", "ejs");

const { proxy, scriptUrl } = require("rtsp-relay")(app);
app.use(express.static("public"));
app.use("/upload", express.static("upload"));
app.use("/face", express.static("face"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.ws("/api/stream", (ws, req) => {
  const { ip_address } = req.query;
  const url = `rtsp://${ip_address}:8554/stream`;

  logger.info(`New RTSP stream connection request for ${ip_address}`);

  const proxyInstance = proxy({ url })(ws);

  // Handle WebSocket errors
  ws.on("error", (error) => {
    logger.error(`WebSocket error for ${ip_address}: ${error.message}`);
    ws.close();
  });

  // Handle WebSocket close
  ws.on("close", () => {
    logger.info(`WebSocket closed for ${ip_address}`);
    // Clean up proxy resources if needed
    if (proxyInstance && typeof proxyInstance.close === "function") {
      proxyInstance.close();
    }
    if (pingInterval) {
      clearInterval(pingInterval);
    }
  });

  // Ping to detect dead connections
  const pingInterval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    } else {
      clearInterval(pingInterval);
    }
  }, 30000); // Every 30 seconds

  // ws.on("pong", () => {
  //   logger.debug(`Pong received from ${ip_address}`);
  // });

  return proxyInstance;
});

app.get("/", async (req, res) => {
  const host = req.get("host");

  try {
    const cameras = await Model.getAlldevice();
    res.render("index", { scriptUrl, cameras, host });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

app.use(require("./routes"));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
