import React from "react";
import { Stack } from "expo-router";

const ChannelLayout = () => {
  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen
        name="[cid]"
        options={{
          headerShown: false,
          headerBackVisible: false,
          headerTitleAlign: "left",
          // headerLeft: () => (
          //   <Pressable onPress={() => router.replace("/(messages)")}>
          //     <Feather name="chevron-left" size={24} color="gray" />
          //   </Pressable>
          // ),
        }}
      />
    </Stack>
  );
};

export default ChannelLayout;
