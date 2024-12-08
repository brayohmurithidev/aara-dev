import {useFonts} from "expo-font";
import {Slot} from "expo-router";
import {ReactNode, useEffect} from "react";
import "react-native-reanimated";
import BootSplash from "react-native-bootsplash";
import {AuthProvider} from "@/context/AuthProvider.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {RootSiblingParent} from "react-native-root-siblings";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {configureFonts, DefaultTheme, PaperProvider} from "react-native-paper";
import {StatusBar} from "expo-status-bar";

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



export default function RootLayout(): ReactNode {

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      BootSplash.hide({ fade: true });
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
      <RootSiblingParent>
        <GestureHandlerRootView>
          <PaperProvider theme={customTheme}>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <Slot />
                <StatusBar />
              </AuthProvider>
            </QueryClientProvider>
          </PaperProvider>
        </GestureHandlerRootView>
      </RootSiblingParent>
  );
}
