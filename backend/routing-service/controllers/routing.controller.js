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