import AsyncStorage from "@react-native-async-storage/async-storage";
import {createClient} from "@supabase/supabase-js";
import {AppState} from "react-native";



const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;


export const supabase = createClient(url, key, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession:true,
        detectSessionInUrl:false
    }
})


AppState.addEventListener('change', async (state) =>{
    if(state === 'active'){
       await supabase.auth.startAutoRefresh()
    }else{
        await  supabase.auth.startAutoRefresh()
    }
})