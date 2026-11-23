import type { RouteCalculation, TransportMode } from "@/types/Route";

export interface RouteSummary {
    distance: string;
    duration: string;
    arrivalTime: string;
}

// TEMPORARY!!!!!!!!!!!!
export const STATIC_TRANSIT_ROUTE: RouteSummary = {
    distance: '4.2km',
    duration: '30 min',
    arrivalTime: 'Chegada às 13:03'
}

export const OPENROUTESERVICE_ATTRIBUTION = '© openrouteservice.org by HeiGIT | Map data © OpenStreetMap contributors';

export const formatRouteDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)} m`;

    return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

export const formatRouteDuration = (seconds: number): string => {
    const totalMinutes = Math.max(1, Math.round(seconds / 60));

    if (totalMinutes < 60) return `${totalMinutes} min`;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return minutes > 0
    ? `${hours} h ${minutes} min` 
    : `${hours} h`;
}

export const formatArrivalTime = (durationSeconds: number): string => {
    const arrivalDate = new Date(Date.now() + durationSeconds * 1000);

    const time = arrivalDate.toLocaleDateString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `Chegada às ${time}`;
}

export const getRouteSummary = (mode: TransportMode, routes: RouteCalculation | null): RouteSummary | null => {
    if (mode === 'transit') return STATIC_TRANSIT_ROUTE;

    const route = routes?.[mode];

    if (!route) return null;

    return {
        distance: formatRouteDistance(route.distanceMeters),
        duration: formatRouteDuration(route.durationSeconds),
        arrivalTime: formatArrivalTime(route.durationSeconds)
    }
}

export const getRouteDurationLabel = (mode: TransportMode, routes: RouteCalculation | null, loading: boolean): string => {
    return(
        getRouteSummary(mode, routes)?.duration ?? (loading ? 'A calcular...' : '--')
    )
}