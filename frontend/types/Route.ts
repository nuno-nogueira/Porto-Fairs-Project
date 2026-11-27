export type TransportMode = 'driving' | 'walking' | 'transit';

// openRouteService types

export interface RouteCoordinates {
    latitude: number;
    longitude: number;
}

export interface RouteInstruction {
    instruction: string;
    distanceMeters: number;
    durationSeconds: number;
    type: number;
    name ?: string;
    wayPoints ?: number[];
}

export interface CalculatedRoute {
    distanceMeters: number;
    durationSeconds: number;
    attribution: string | null;
    geometry: {
        type: 'LineString';
        coordinates: [number, number][];
    };
    instructions: RouteInstruction[];
}

export interface RouteCalculation {
    driving: CalculatedRoute;
    walking: CalculatedRoute;
}

export interface CalculatedRoutesRequest {
    origin: RouteCoordinates;
    destination: RouteCoordinates;
}

export interface RouteAPIResponse {
    message: string;
    data: RouteCalculation;
}

// MOTIS types

export interface PublicTransportRoutesRequest {
    origin: RouteCoordinates;
    destination: RouteCoordinates;
    time ?: string;
    arriveBy ?: boolean;
    maxTransfers ?: number;
}

export interface MotisPlace {
    name: string;
    lat: number;
    lon: number;
    stopId ?: string;
    stopCode ?: string;
    tz ?: string;
    arrival ?: string;
    departure ?: string;
    scheduledArrival ?: string;
    scheduledDeparture ?: string;
    vertexType ?: string;
    modes ?: string[];
}

export interface MotisLegGeometry {
    points: string;
    precision: number;
    length: number;
}

export interface MotisLeg {
    mode: string;
    from: MotisPlace;
    to: MotisPlace;

    duration: number;
    startTime: string;
    endTime: string;

    scheduledStartTime ?: string;
    scheduledEndTime ?: string;

    realTime ?: boolean;
    scheduled ?: boolean;
    distance ?: number;

    legGeometry ?: MotisLegGeometry;

    routeId ?: string;
    routeShortName ?: string;
    routeLongName ?: string;
    displayName ?: string;
    headSign ?: string;

    routeColor ?: string;
    routeTextColor ?: string;

    agencyName ?: string;
    agencyId ?: string;

    tripFrom ?: MotisPlace;
    tripTo ?: MotisPlace;
    intermediatesStops ?: MotisPlace[];
}

export interface MotisItinerary {
    id: string;
    duration: number;
    startTime: string;
    endTime: string;
    transfers: number;
    legs: MotisLeg[];
}

export interface MotisPlanResponse {
    requestParameters ?: Record<string, unknown>;
    debugOutput ?: Record<string, number>;

    from: MotisPlace;
    to: MotisPlace;

    direct ?: unknown[];
    itineraries: MotisItinerary[];
}

export interface PublicTransportAPIResponse {
    message: string;
    data: MotisPlanResponse;
}