import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { AuthProvider, useAuth } from "@/context/AuthProvider.tsx";
import { RootSiblingParent } from "react-native-root-siblings";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";

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
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
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
    <PaperProvider theme={customTheme}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </PaperProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { initialized, session } = useAuth();

  useEffect(() => {
    if (!initialized) return;
    if (session) {
      router.replace("/(auth)/");
    } else if (!session) {
      router.replace("/entry");
    }

    SplashScreen.hideAsync();
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
