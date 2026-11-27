
export const decodePolyline = (
    encoded: string,
    precision: number = 6
): [number, number][] => {
    if (!encoded) return [];

    const coordinates: [number, number][] = [];

    let index = 0;
    let latitude = 0;
    let longitude = 0;

    const factor = Math.pow(10, precision);

    const decodeValue = (): number => {
        let result = 0;
        let shift = 0;
        let byte = 0;

        do {
            if (index >= encoded.length) {
                throw new Error('Invalid encoded polyline.');
            }

            byte = encoded.charCodeAt(index++) - 63;

            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        return (result & 1)
            ? ~(result >> 1)
            : (result >> 1);
    };

    while (index < encoded.length) {
        latitude += decodeValue();
        longitude += decodeValue();

        coordinates.push([
            longitude / factor,
            latitude / factor
        ]);
    }

    return coordinates;
};
