import { Stack } from "expo-router";
import ChatProvider from "@/context/ChatProvider.tsx";

const AuthLayout = () => {
  return (
    <ChatProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="channel" options={{ headerShown: false }} />
      </Stack>
    </ChatProvider>
  );
};

export default AuthLayout;
