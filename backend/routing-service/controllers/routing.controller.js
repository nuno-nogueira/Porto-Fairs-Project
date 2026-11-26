import axios from 'axios';
import logger from '../utils/logger.js';
import { calculateRoutes } from '../services/openrouteservice.service.js';
import { calculatePublicTransportRoutes } from '../services/motis.service.js';

const isValidCoordinate = (value, min, max) => 
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max;

const isValidPoint = (point) => 
    point &&
    isValidCoordinate(point.latitude, -90, 90) &&
    isValidCoordinate(point.longitude, -180, 180);

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
    } catch (error) {
        const providerStatus = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;

    const providerError = error.response?.data?.error;

    const providerErrorCode =
        typeof providerError === 'object' && providerError !== null
            ? providerError.code
            : undefined;

    const providerErrorMessage =
        typeof providerError === 'object' && providerError !== null
            ? providerError.message
            : typeof providerError === 'string'
                ? providerError
                : error.message;

    logger.error({
        message: error.message,
        providerStatus,
        providerErrorCode,
        providerErrorMessage,
        errorCode: error.code,
    }, 'POST /routes - Failed.');

    if ([2009, 2010, 2016].includes(Number(providerErrorCode))) {
        return res.status(422).json({
            error: 'Não foi possível encontrar um percurso entre estas localizações.',
        });
    }

    if (providerStatus === 400) {
        return res.status(422).json({
            error: 'Não foi possível calcular o percurso com as coordenadas fornecidas.',
        });
    }

    if (providerStatus === 429) {
        return res.status(429).json({
            error: 'Limite de pedidos de rotas atingido. Tenta novamente mais tarde.',
        });
    }

    if ([401, 403].includes(providerStatus)) {
        return res.status(503).json({
            error: 'O serviço de rotas está temporariamente indisponível.',
        });
    }

    if ([500, 503].includes(providerStatus)) {
        return res.status(503).json({
            error: 'O serviço de rotas está temporariamente indisponível.',
        });
    }

    if (providerStatus === 404) {
        return res.status(502).json({
            error: 'O serviço de rotas devolveu uma resposta inesperada.',
        });
    }

    if (
        error.code === 'ECONNABORTED' ||
        error.code === 'ETIMEDOUT'
    ) {
        return res.status(504).json({
            error: 'O pedido de cálculo da rota demorou demasiado tempo.',
        });
    }

    return res.status(502).json({
        error: 'Não foi possível calcular as rotas neste momento.',
    });
    }
}

export const getPublicTransportRoutes = async(req, res) => {
    try {
        logger.info('POST /routes/public-transport received');

        const {origin, destination, time, arriveBy, maxTransfers} = req.body ?? {};

        if (!isValidPoint(origin) || !isValidPoint(destination)) {
             return res.status(400).json({
                error: 'Invalid coordinates: Both origin and destination must contain valid latitude and longitude values'
            });
        }

        if (time !== undefined && (
            typeof time !== 'string' ||
            !Number.isFinite(Date.parse(time))
        )) {
            return res.status(400).json({
                error: 'Invalid time: Provide a valid ISO 8601 date-time'
            });
        }

        if (arriveBy !== undefined && typeof arriveBy !== 'boolean') {
            return res.status(400).json({
                error: 'arriveBy must be a boolean'
            });
        }

        if (maxTransfers !== undefined && (
            !Number.isInteger(maxTransfers) ||
            maxTransfers < 0 ||
            maxTransfers > 10
        )) {
            return res.status(400).json({
                error: 'maxTransfers must be an integer between 0 and 10'
            });
        }

        const routes = await calculatePublicTransportRoutes(origin, destination, { time, arriveBy, maxTransfers });

        logger.info('POST /routes/public-transport - Routes calculated successfully.');

        return res.status(200).json({
            message: routes.itineraries.length > 0
                ? 'Public transport routes calculated successfully.'
                : 'No public transport itineraries found.',
            data: routes
        });
    } catch (err) {
        const providerStatus = axios.isAxiosError(err) ? err.response?.status : undefined;

        logger.error({
            message: err.message,
            providerStatus,
            errorCode: err.code
        }, 'POST /routes/public-transport - Failed.');
        
        if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
            return res.status(504).json({
                error: 'The public-transport routing request timed out'
            });
        }

        if (
            err.code === 'ECONNREFUSED' ||
            err.code === 'ENOTFOUND' ||
            err.code === 'EHOSTUNREACH'
        ) {
            return res.status(503).json({
                error: 'The public-transport routing service is unavailable'
            });
        }

        if (providerStatus === 400 || providerStatus === 422) {
            return res.status(422).json({
                error: 'MOTIS could not calculate a journey for the supplied locations.'
            });
        }

        if (providerStatus === 404) {
            return res.status(502).json({
                error: 'MOTIS returned an unexpected response.'
            });
        }

        if (providerStatus >= 500) {
            return res.status(503).json({
                error: 'The public-transport routing service is temporarily unavailable.'
            });
        }

        return res.status(502).json({
            error: 'Unable to calculate public-transport routes at this time.'
        });
    }
}