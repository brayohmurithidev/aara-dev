import { router, Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/context/AuthProvider.tsx";
import { RootSiblingParent } from "react-native-root-siblings";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { FontAwesome } from "@expo/vector-icons";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import configureFonts from "react-native-paper/src/styles/fonts.tsx";
import BootSplash from "react-native-bootsplash";

const queryClient = new QueryClient();

const fontConfig = {
  WorkSans: {
    regular: {
      fontFamily: "WorkSans-Regular",
      fontWeight: "400",
    },
  },
  titleLarge: {
    fontSize: 28,
    fontWeight: 900,
    fontFamily: "WorkSans-Regular",
  },
  titleMedium: {
    fontWeight: 700,
    fontSize: 24,
  },
  titleSmall: {
    fontSize: 20,
    fontWeight: 600,
  },
  bodyLarge: {
    fontSize: 18,
  },
  bodyMedium: {
    fontSize: 16,
  },
  bodySmall: {
    fontSize: 12,
  },
};

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

const InitialLayout = () => {
  const { session, initialized } = useAuth();

  useEffect(() => {
    if (!initialized) return;
    if (!session) {
      router.replace("/");
    } else if (session?.user) {
      router.replace("/(auth)/(tabs)/");
    }
    if (initialized && (session || !session)) {
      BootSplash.hide({ fade: true });
    }
  }, [initialized, session]);

  return <Slot />;
};

const RootLayout = () => {
  const [loaded, error] = useFonts({
    "WorkSans-Regular": require("../assets/fonts/WorkSans-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) return null;
  return (
    <RootSiblingParent>
      <GestureHandlerRootView>
        <PaperProvider theme={customTheme}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <InitialLayout />
            </AuthProvider>
          </QueryClientProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </RootSiblingParent>
  );
};

export default RootLayout;
