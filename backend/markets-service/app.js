import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import "dotenv/config";

import typeDefs from "./graphql/schema.js";
import resolvers from "./graphql/resolvers.js";
import logger from "./utils/logger.js";
import db from "./models/db.js";
import { authenticateToken } from "./middlewares/auth.middleware.js";

const PORT = Number(process.env.GRAPHQL_PORT || 3001);
const HOST = process.env.BIND_HOST || "0.0.0.0";

async function startServer() {
  await db.connect();

  const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT, host: HOST },
    context: async ({ req }) => ({ user: authenticateToken(req) }),
  });

  logger.info(`GraphQL Markets Service running at: ${url}`);
}

startServer().catch((error) => {
  logger.error({ err: error }, "Markets service failed to start.");
  process.exit(1);
});
