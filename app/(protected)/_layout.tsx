import {Redirect, Stack} from "expo-router";
import {useAuth} from "@/context/AuthProvider.tsx";
import {ActivityIndicator} from "react-native";

const ProtectedLayout = (props: any) => {
 const {initialized, session}=   useAuth()
    if(!initialized){
        return <ActivityIndicator />
    }
    if(!session){
        return <Redirect href='/entry' />
    }
    return (
        <Stack screenOptions={{ headerShown: false }} >
            <Stack.Screen name='(auth)' />
        </Stack>
    )
}

export default ProtectedLayout