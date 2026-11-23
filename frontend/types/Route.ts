export type TransportMode = 'driving' | 'walking' | 'transit'

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