

export const getNearbyPlaces = async (latitude: number, longitude:number) =>{
    const radius  = 5 * 1609.34;
    const API_KEY = 'AIzaSyB1IH_U1t5algXX9tvDF8O9zrUf-QMc-f8';
    const url = `https://maps.googleapis.com/maps/api/place/nearbySearch/json?location=${latitude},${longitude}&radius=${radius}&type=locality&key=${API_KEY}`;
}