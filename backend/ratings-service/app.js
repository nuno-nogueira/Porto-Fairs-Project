import express from "express";
import "dotenv/config";
import logger from "./utils/logger.js";
import ratingsRoutes from "./routes/ratings.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "./swagger-output.json" with { type: "json" };
import db from "./models/db.js";

const app = express();
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use("/ratings", ratingsRoutes);

const PORT = Number(process.env.PORT || 3004);
const HOST = process.env.HOST || "0.0.0.0";

async function startServer() {
  await db.connect();
  app.listen(PORT, HOST, () => {
    logger.info(`Ratings service listening on ${HOST}:${PORT}`);
  });
}

startServer().catch((error) => {
  logger.error({ err: error }, "Ratings service failed to start.");
  process.exit(1);
});
