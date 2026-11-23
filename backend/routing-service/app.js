
import express from 'express';
import 'dotenv/config';
import logger from './utils/logger.js';
import routingRoutes from './routes/routing.routes.js';

const app = express();

app.use(express.json({ limit: '10kb' }));

app.use('/routes', routingRoutes);

const PORT = Number(process.env.PORT || 3006);
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured.');
    }

    if (!process.env.OPENROUTESERVICE_API_KEY) {
        throw new Error('OPENROUTESERVICE_API_KEY is not configured.');
    }

    app.listen(PORT, HOST, () => {
        logger.info(`Routing service listening on ${HOST}:${PORT}`);
    });
}

startServer().catch((error) => {
    logger.error({
        message: error.message,
    }, 'Routing service failed to start.');

    process.exit(1);
});
