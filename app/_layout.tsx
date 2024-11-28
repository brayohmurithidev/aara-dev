import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { AuthProvider, useAuth } from "@/context/AuthProvider.tsx";
import { RootSiblingParent } from "react-native-root-siblings";
import {
  configureFonts,
  DefaultTheme,
  PaperProvider,
} from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const queryClient = new QueryClient();

const fontConfig = {
  fontFamily: "Work Sans",
  // customVariant: {
  //   fontFamily: Platform.select({
  //     web: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
  //     ios: 'System',
  //     default: 'sans-serif',
  //   }),
  //   fontWeight: '400',
  //   letterSpacing: 0.5,
  //   lineHeight: 22,
  //   fontSize: 20,
  // }
};

// Custom themes
const customTheme = {
  ...DefaultTheme, // Start with the default theme
  roundness: 8, // Adjust roundness for components
  colors: {
    ...DefaultTheme.colors, // Extend default colors
    primary: "#6F5C50", // Custom primary color
    accent: "#E3F1B0", // Custom accent color
    background: "#F2EFED", // Background color
    surface: "#ffffff", // Surface color
    text: "#000000", // Text color
  },
  fonts: configureFonts({ config: fontConfig }),
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    WorkSans: require("../assets/fonts/WorkSans-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // useEffect(() => {
  //   if (loaded) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <PaperProvider theme={customTheme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </QueryClientProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { initialized, session } = useAuth();

  useEffect(() => {
    if (!initialized) return;
    if (session) {
      router.replace("/(auth)/");
      SplashScreen.hideAsync();
    } else if (!session) {
      router.replace("/entry");
      SplashScreen.hideAsync();
    }
  }, [initialized, session]);

  return (
    <RootSiblingParent>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="entry" />
        <Stack.Screen name="login" />
      </Stack>
      <StatusBar backgroundColor="transparent" />
    </RootSiblingParent>
  );
}
