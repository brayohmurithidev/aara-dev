import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { forwardRef } from "react";
import { Pressable, View } from "react-native";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { TabList, Tabs, TabTrigger } from "expo-router/ui";

const TabButton = forwardRef<View, BottomTabBarButtonProps>((props, ref) => {
  return (
    <Pressable ref={ref} {...props}>
      <View>
        <Ionicons name={props.iconName} color="#000" size={16} />
        <Text>{props?.tabName}</Text>
      </View>
    </Pressable>
  );
});

const TabsLayout = () => {
  const { top, bottom } = useSafeAreaInsets();
  return (
    <Tabs>
      <TabList>
        <TabTrigger name="home" href="/home" />
      </TabList>
    </Tabs>
    // <Tabs screenOptions={{ headerShown: false }}>
    //   {/*<TabSlot style={{ flex: 1, marginTop: top + 20 }} />*/}
    //   {/*<TabList style={{ display: "absolute", bottom, left: 16 }}>*/}
    //   {/*  /!* Trigger for Home *!/*/}
    //   {/*  <TabTrigger name="index" href="/(auth)/(tabs)/" asChild>*/}
    //   {/*    <TabButton tabName="Home" iconName="home" />*/}
    //   {/*  </TabTrigger>*/}
    //
    //   {/*  /!* Trigger for Workout *!/*/}
    //   {/*  <TabTrigger name="workout" href="/(auth)/(tabs)/workout" asChild>*/}
    //   {/*    <Text>Workout</Text>*/}
    //   {/*  </TabTrigger>*/}
    //   {/*</TabList>*/}
    // </Tabs>
  );
};

export default TabsLayout;
