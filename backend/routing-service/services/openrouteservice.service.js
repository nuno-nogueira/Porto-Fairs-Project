import axios from 'axios';
import 'dotenv/config';
import logger from '../utils/logger.js';

const ORS_BASE_URL = 'https://api.heigit.org/openrouteservice/v2/directions';

const getRoute = async(profile, coordinates) => {
    const apiKey = process.env.OPENROUTESERVICE_API_KEY;

    if (!apiKey) throw new Error('OPENROUTESERVICE_API_KEY is not configured.');

    const response = await axios.post(
        `${ORS_BASE_URL}/${profile}/geojson`,
        {
            coordinates,
            instructions: true
        },
        {
            headers: {
                Authorization: apiKey,
                'Content-Type': 'application/json',
                Accept: 'application/geo+json'
            },
            timeout: 15000
        }
    );

    const feature = response.data?.features?.[0];

    if (!feature) throw new Error(`No route feature returned for profile ${profile}.`);

    const summary = feature.properties?.summary;
    const geometry = feature.geometry;

    if (!summary || !geometry || !Array.isArray(geometry.coordinates)) throw new Error(`Invalid route response for profile ${profile}.`);

    // Extract navigation instructions
     const instructions = (
        feature.properties?.segments ?? []
    ).flatMap((segment) =>
        (segment.steps ?? []).map((step) => ({
            instruction: step.instruction,
            distanceMeters: step.distance,
            durationSeconds: step.duration,
            type: step.type,
            name: step.name,
            wayPoints: step.way_points,
        }))
    );

    logger.info(`Route calculated sucessfully -> ${profile}`);

    return {
        distanceMeters: summary.distance,
        durationSeconds: summary.duration,
        attribution: response.data?.metadata?.attribution ?? null,
        geometry: {
            type: geometry.type,
            coordinates: geometry.coordinates,
        },
        instructions
    };
}

export const calculateRoutes = async(origin, destination) => {
    const coordinates = [
        [origin.longitude, origin.latitude],
        [destination.longitude, destination.latitude]
    ];

    const [driving, walking] = await Promise.all([
        getRoute('driving-car', coordinates),
        getRoute('foot-walking', coordinates)
    ]);

    return {
        driving, walking
    }
}