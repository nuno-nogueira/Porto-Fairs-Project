import axios from 'axios';
import logger from '../utils/logger.js';

const MOTIS_BASE_URL = (
    process.env.MOTIS_BASE_URL || 'http://host.docker.internal:8090'
).replace(/\/+$/, '');

export const calculatePublicTransportRoutes = async(origin, destination, options = {}) => {
    const {time, arriveBy = false, maxTransfers, searchWindow = 3600} = options;

    const params = new URLSearchParams();

    params.set(
        `fromPlace`, `${origin.latitude},${origin.longitude}`
    );

    params.set(
        `toPlace`,
        `${destination.latitude},${destination.longitude}`
    );

    // allow public-transport modes
    params.set('transitModes', 'TRANSIT');

    // calculate walking connections for the first and last mile
    params.set('preTransitModes', 'WALK');
    params.set('postTransitModes', 'WALK');

    params.set('directModes', '');

    // request geomtry and details for map visiualization
    params.set('detailedLegs', 'true');
    params.set('detailedTransfers', 'true');
    params.set('joinInterlineLegs', 'false');

    params.set('language', 'pt');

    // explicit departure/arrival time
    params.set('time', time || new Date().toISOString());

    params.set('arriveBy', String(arriveBy));

    params.set('searchWindow', String(searchWindow));

    if(Number.isInteger(maxTransfers) && maxTransfers >= 0) params.set('maxTransfers', String(maxTransfers));

    const url = `${MOTIS_BASE_URL}/api/v6/plan?${params.toString()}`;

    logger.info({
        url,
        origin,
        destination,
        searchWindow,
        time: params.get('time')
    }, 'Requesting public transport routes from MOTIS.');

    const response = await axios.get(url, {
        headers: {
            Accept: 'application/json'
        },
        timeout: 30000
    });

    const result = response.data;

    if (!result || !Array.isArray(result.itineraries)) throw new Error('Invalid response received from MOTIS');

    logger.info({
        itineraryCount: result.itineraries.length
    }, 'Public transport routes calculated successfully.');


    return result;
}