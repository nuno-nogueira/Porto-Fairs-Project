import type { MotisPlanResponse, RouteCalculation, TransportMode } from "@/types/Route";

export interface RouteSummary {
    distance: string;
    duration: string;
    arrivalTime: string;
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

const formatTransitArrivalTime = (endTime: string): string => {
    const arrivalDate = new Date(endTime);

    if (Number.isNaN(arrivalDate.getTime())) return '--';

    const time = arrivalDate.toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Lisbon'
    });

    return `Chegada às ${time}`
}

export const getRouteSummary = (mode: TransportMode, routes: RouteCalculation | null, transitRoutes: MotisPlanResponse| null = null): RouteSummary | null => {
    if (mode === 'transit') {
        const itinerary = transitRoutes?.itineraries[0];

        if (!itinerary) return null;

        const hasCompleteDistances =
            itinerary.legs.length > 0 &&
            itinerary.legs.every(
                leg => 
                    typeof leg.distance === 'number' &&
                    Number.isFinite(leg.distance)
            );

        const totalDistance = hasCompleteDistances
            ? itinerary.legs.reduce(
                (total, leg) => total + (leg.distance ?? 0), 0) : null;

        return{
            distance: totalDistance !== null
                ? formatRouteDistance(totalDistance)
                : '--',
            duration: formatRouteDuration(itinerary.duration),
            arrivalTime: formatTransitArrivalTime(itinerary.endTime)
        };
    }

    const route = routes?.[mode];

    if (!route) return null;

    return {
        distance: formatRouteDistance(route.distanceMeters),
        duration: formatRouteDuration(route.durationSeconds),
        arrivalTime: formatArrivalTime(route.durationSeconds)
    }
}

export const getRouteDurationLabel = (mode: TransportMode, routes: RouteCalculation | null, loading: boolean, transitRoutes: MotisPlanResponse | null = null): string => {
    return(
        getRouteSummary(mode, routes, transitRoutes)?.duration ?? (loading ? 'A calcular...' : '--')
    )
}