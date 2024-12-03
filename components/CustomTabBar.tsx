import { Keyboard, LayoutChangeEvent, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import TabBarButton from "@/components/tabBarButton";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Trough from "../assets/svgs/through.svg";

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const [dimensions, setDimensions] = useState({ height: 20, width: 100 });
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const buttonWidth = dimensions.width / state.routes.length;

  const onTabbarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width,
    });
  };

  const tabPositionX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: tabPositionX.value,
        },
      ],
    };
  });

  // Update tab position when index changes
  useEffect(() => {
    tabPositionX.value = withSpring(buttonWidth * state.index, {
      stiffness: 100, // Control the bounce effect
      damping: 10, // Control how fast the spring settles
    });
  }, [state.index, buttonWidth]);

  // CHECK KEYBOARD VISIBLE
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      },
    );

    // Cleanup listeners on unmount
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <View onLayout={onTabbarLayout} style={styles.tabBar}>
      <Animated.View
        style={[
          animatedStyle,
          {
            position: "absolute",
            borderRadius: 30,
            width: buttonWidth,
            left: -15,
            height: dimensions.height,
          },
        ]}
      >
        <Trough
          width={dimensions.width}
          height={dimensions.height}
          stroke={"transparent"}
        />
      </Animated.View>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          tabPositionX.value = withSpring(buttonWidth * index, {
            stiffness: 100,
            damping: 10,
          });
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            route={route}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            color={isFocused ? "#673ab7" : "#222"}
            routeName={route.name}
            label={label}
            troughStyles={animatedStyle}
            buttonWidth={buttonWidth}
            dimensions={dimensions}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E1DAD5", // Background color of the tab bar
    paddingVertical: 25,
    marginHorizontal: "auto",
    borderCurve: "continuous",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
    elevation: 3,
  },
  tabBarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  iconContainer: {
    position: "absolute",
    width: 46,
    height: 46,
    top: -50,
    zIndex: 999,
    backgroundColor: "#BEAFA5",
    borderRadius: 360,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CustomTabBar;
