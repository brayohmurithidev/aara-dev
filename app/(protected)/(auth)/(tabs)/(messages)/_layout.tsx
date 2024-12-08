import React from "react";
import { Stack } from "expo-router";

const MessagesLayout = () => {
  return (
    <Stack
      screenOptions={{
        // headerShown: false,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "transparent",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Chats",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
};

export default MessagesLayout;
