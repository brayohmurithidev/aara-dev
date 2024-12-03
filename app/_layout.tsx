import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthProvider.tsx";
import { RootSiblingParent } from "react-native-root-siblings";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const queryClient = new QueryClient();

const InitialLayout = () => {
  return <Slot />;
};

const RootLayout = () => {
  return (
    <RootSiblingParent>
      <GestureHandlerRootView>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <InitialLayout />
          </AuthProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </RootSiblingParent>
  );
};

export default RootLayout;
