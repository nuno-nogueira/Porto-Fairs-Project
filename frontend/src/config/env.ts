import Constants from 'expo-constants';
import { IP } from '../../.env';

// localhost getter
const getLocalHost = () => {
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost?.split(':')[0];

    if (!localhost) {
        return IP || '10.0.2.2'; //fixed IP for Android emulator to access host machine
    }

    return localhost;
}

export const API_BASE_URL = `http://${getLocalHost()}/api`;

console.log('Connect to backend:', API_BASE_URL);