const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");
const mongoose = require("mongoose");
const pino = require("pino");
require("dotenv").config();

const app = express();
const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

const notificationsRoutes = require("./routes/notifications.routes.js");
app.use("/notifications", notificationsRoutes);

// Register the scheduled notification job once when the service starts.
require("./jobs/cron.js");

const PORT = Number(process.env.PORT || 3002);
const HOST = process.env.HOST || "0.0.0.0";
const MONGO_URL = process.env.MONGO_URL || process.env.MONGO_URI;

async function startServer() {
  if (!MONGO_URL) {
    throw new Error("Set MONGO_URL for the Notifications Service.");
  }

  await mongoose.connect(MONGO_URL);
  logger.info("Notifications service connected to MongoDB.");

  app.listen(PORT, HOST, () => {
    logger.info(`Notifications service listening on ${HOST}:${PORT}`);
  });
}

startServer().catch((error) => {
  logger.error({ err: error }, "Notifications service failed to start.");
  process.exit(1);
});
