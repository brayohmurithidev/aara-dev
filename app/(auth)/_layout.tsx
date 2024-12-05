import { Stack } from "expo-router";

const AuthLayout = () => {
  return (
    // <ChatProvider>
    //   </ChatProvider>
    // <ChatProvider>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="channel" options={{ headerShown: false }} />
    </Stack>
    // {/*</ChatProvider>*/}
  );
};

export default AuthLayout;
