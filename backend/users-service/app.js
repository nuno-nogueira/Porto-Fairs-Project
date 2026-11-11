const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");
const pino = require("pino");
require("dotenv").config();

const db = require("./models/db.js");
const app = express();

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use("/uploads", express.static("uploads"));

const userRoutes = require("./routes/users.routes.js");
const sellerRoutes = require("./routes/sellers.routes.js");
const questionnaireRoutes = require("./routes/questionnaires.routes.js");

app.use(userRoutes);
app.use("/users/sellers", sellerRoutes);
app.use("/users/questionnaires", questionnaireRoutes);

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";

async function startServer() {
  try {
    await db.connect();
    app.listen(PORT, HOST, () => {
      logger.info(`Users service listening on ${HOST}:${PORT}`);
    });
  } catch (error) {
    logger.error({ err: error }, "Users service failed to start because MongoDB is unavailable.");
    process.exit(1);
  }
}

startServer();
