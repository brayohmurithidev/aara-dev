import React from "react";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WorkoutLayout = () => {
  const { top } = useSafeAreaInsets();
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "transparent",
        },
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default WorkoutLayout;
