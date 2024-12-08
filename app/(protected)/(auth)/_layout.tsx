import {Stack} from "expo-router";
import ChatProvider from "@/context/ChatProvider.tsx";

const AuthLayout = () => {
  return (
    <ChatProvider>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)" >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="channel" options={{ headerShown: false }} />
      </Stack>
    </ChatProvider>
  );
};

export default AuthLayout;
