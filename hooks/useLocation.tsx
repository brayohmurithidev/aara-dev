import * as Location from "expo-location";
import {useEffect, useState} from "react";


export default function useLocation() {
    const [location, setLocation] = useState<object | null>(null);
    const [currentCity, setCurrentCity] = useState<object | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);


    useEffect(() => {
        (async ()=>{
            let {status} = await Location.requestForegroundPermissionsAsync()
            if(status !== 'granted'){
                setErrorMsg("Permission to access Location denied")
                return;
            }

            let location = await Location.getCurrentPositionAsync({})
            setLocation(location)
            const {coords} = location
            let city = await Location.reverseGeocodeAsync(coords)
            setCurrentCity(city)
        })();
    }, []);

    return {location, errorMsg, currentCity};
}