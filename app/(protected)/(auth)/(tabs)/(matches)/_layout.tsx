import React from "react";
import { Stack } from "expo-router";
import { chevronLeft } from "@/constants/images.ts";

const MatchesLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "transparent",
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Find Match",
          headerTitleAlign: "center",
          headerBackVisible: true,
          headerBackImageSource: chevronLeft,
          headerBackTitleVisible: true,
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
};

export default MatchesLayout;
