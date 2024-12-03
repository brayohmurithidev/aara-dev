import React from "react";
import { Tabs, usePathname } from "expo-router";
import { Feather } from "@expo/vector-icons";
import CustomTabBar from "@/components/CustomTabBar.tsx";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          display: ["profileUpdate", "matchSearch"].includes(usePathname())
            ? "none"
            : "flex",
          backgroundColor: "#E1DAD5",
        },
        headerStyle: {
          backgroundColor: "#F2EFED",
        },
        tabBarHideOnKeyboard: true,
      })}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(workout)"
        options={{
          title: "Workout",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Feather name="dribbble" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(matches)"
        options={{
          title: "Matches",
          tabBarHideOnKeyboard: true,
          tabBarIcon: ({ color }) => (
            <Feather name="users" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(messages)"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => (
            <Feather name="message-circle" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
