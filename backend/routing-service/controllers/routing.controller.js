import axios from 'axios';
import logger from '../utils/logger.js';
import { calculateRoutes } from '../services/openrouteservice.service.js';

const isValidCoordinate = (value, min, max) => 
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max;

const isValidPoint = (point) => 
    point &&
    isValidCoordinate(point.latitude, -90, 90) &&
    isValidCoordinate(point.longitude, -100, 100);

export const getRoutes = async(req, res) => {
    try {
        logger.info('POST /routes received.');

        const { origin, destination } = req.body ?? {};

        if (!isValidPoint(origin) || !isValidPoint(destination)) {
            return res.status(400).json({
                error: 'Invalid coordinates. Both origin and destination must contain valid latitude and longitude values.',
            });
        }

        // calculate driving and walking routes
        const routes = await calculateRoutes(origin, destination);

        logger.info('POST /routes - Routes calculated successfully.');

        return res.status(200).json({
            message: 'Routes calculated successfully.',
            data: routes,
        });
    } catch (err) {
        const providerStatus = axios.isAxiosError(err)
            ? err.response?.status
            : undefined;

        // avoid logging request coordinates or authorization headers
        logger.error({
            message: err.message,
            providerStatus,
            providerCode: axios.isAxiosError(err)
                ? err.code
                : undefined,
        }, 'POST /routes - Failed.');

        if (providerStatus === 429) {
            return res.status(429).json({
                error: 'Routing provider rate limit reached. Please try again later.',
            });
        }

        if (providerStatus === 403 || providerStatus === 401) {
            return res.status(503).json({
                error: 'Routing provider rejected the request. Check the API key or daily quota.',
            });
        }

        if (providerStatus === 404) {
            return res.status(422).json({
                error: 'No route could be calculated for the provided coordinates.',
            });
        }

        if (
            axios.isAxiosError(err) &&
            err.code === 'ECONNABORTED'
        ) {
            return res.status(504).json({
                error: 'Routing provider request timed out.',
            });
        }

        return res.status(502).json({
            error: 'Unable to calculate routes at the moment.',
        });
    }
}