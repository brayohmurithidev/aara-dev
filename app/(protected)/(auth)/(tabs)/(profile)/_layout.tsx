import React from "react";
import { Stack } from "expo-router";

const ProfileLayout = () => {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default ProfileLayout;
