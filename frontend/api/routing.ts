import api from './axios';
import axios from 'axios';
import type {
    CalculatedRoutesRequest,
    RouteAPIResponse,
    CalculatedRoute,
    RouteCalculation,
} from '../types/Route';

export const calculateRoutes = async(request: CalculatedRoutesRequest): Promise<RouteCalculation> => {
    const response = await api.post<RouteAPIResponse>('/routes', request, {timeout: 20000});

    const routeData = response.data?.data;

    if (!routeData || !isValidRoute(routeData.driving) || !isValidRoute(routeData.walking)) {
        throw new Error('Invalid routing response: missing route information.');
    }

    return routeData;
} 

export const getRoutingErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const apiMessage = error.response?.data?.error;

        if (status === 401 || status === 403) {
            return 'Tens de iniciar sessão para utilizar esta funcionalidade.';
        }

        if (status === 422) {
            return typeof apiMessage === 'string'
                ? apiMessage
                : 'Não foi possível encontrar um percurso para estas localizações.';
        }

        if (status === 429) {
            return 'Demasiados pedidos. Tenta novamente mais tarde.';
        }

        if (status === 503) {
            return 'O serviço de rotas está temporariamente indisponível.';
        }

        if (status === 504 || error.code === 'ECONNABORTED') {
            return 'O cálculo da rota demorou demasiado tempo.';
        }

        if (!error.response) {
            return 'Não foi possível contactar o servidor. Verifica a tua ligação.';
        }

        return typeof apiMessage === 'string'
            ? apiMessage
            : 'Ocorreu um erro ao calcular a rota.';
    }

    return error instanceof Error
        ? error.message
        : 'Ocorreu um erro inesperado ao calcular a rota.';
}

const isValidRoute = (route: CalculatedRoute | undefined): boolean => {
    if (!route) return false;

    const validSummary =
        Number.isFinite(route.distanceMeters) &&
        route.distanceMeters >= 0 &&
        Number.isFinite(route.durationSeconds) &&
        route.durationSeconds >= 0

    const validGeometry = 
        route.geometry?.type === 'LineString' &&
        Array.isArray(route.geometry.coordinates) &&
        route.geometry.coordinates.length >= 2 &&
        route.geometry.coordinates.every(
            (coordinate) =>
                Array.isArray(coordinate) &&
                coordinate.length >= 2 &&
                Number.isFinite(coordinate[0]) &&
                Number.isFinite(coordinate[1])
        )

    const validInstructions = Array.isArray(route.instructions);

    return validSummary && validGeometry && validInstructions;
}
