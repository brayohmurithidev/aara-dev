import { StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Image } from "expo-image";
import {
  homeDark,
  homeLight,
  matchDark,
  matchLight,
  messageDark,
  messageLight,
  userDark,
  userLight,
  workoutDark,
  workoutLight,
} from "@/constants/images";

const TabBarButton = ({
  onPress,
  onLongPress,
  isFocused,
  color,
  routeName,
  label,
  route,
  troughStyles,
  buttonWidth,
  dimensions,
}: {
  onPress: Function;
  onLongPress: Function;
  isFocused: boolean;
  color: string;
  routeName: string;
  label: string;
  route: any;
  troughStyles: any;
  buttonWidth: any;
  dimensions: any;
}) => {
  const primaryColor = "#222";
  const activeColor = "#000000";
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0);
  const translateY = useSharedValue(0);

  const animationDuration = 300;

  useEffect(() => {
    scale.value = withSpring(
      typeof isFocused === "boolean" ? (isFocused ? 0 : 1) : isFocused,
      { duration: 350 },
    );
  }, [scale, isFocused]);

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [1, 0], [0, 1]);

    return {
      opacity,
    };
  });

  useEffect(() => {
    // Animate the icon to move up when focused, and return to its original position when not
    translateY.value = withSpring(isFocused ? -10 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [1, 0], [1.2, 1]);
    const bottom = interpolate(scale.value, [0, 1], [0, 9]);

    return {
      transform: [
        {
          translateY: translateY.value,
        },
        // {
        //   scale: scaleValue,
        // },
      ],
      // bottom,
    };
  });

  // ICONS
  const icons = {
    index: (props: any) =>
      props.isFocused ? (
        <Image
          source={homeDark}
          style={{ width: 32, height: 32 }}
          contentFit="contain"
        />
      ) : (
        <Image
          source={homeLight}
          style={{ width: 32, height: 32 }}
          contentFit="contain"
        />
      ),
    "(workout)": (props: any) =>
      props.isFocused ? (
        <Image
          source={workoutDark}
          style={{ width: 32, height: 32 }}
          contentFit="contain"
        />
      ) : (
        <Image
          source={workoutLight}
          style={{ width: 32, height: 32 }}
          contentFit="contain"
        />
      ),
    "(matches)": (props: any) =>
      props.isFocused ? (
        <Image
          source={matchDark}
          style={{ width: 32, height: 32 }}
          contentFit="contain"
        />
      ) : (
        <Image
          source={matchLight}
          style={{ width: 32, height: 32 }}
          contentFit="contain"
        />
      ),
    "(messages)": (props: any) =>
      props.isFocused ? (
        <Image
          source={messageDark}
          style={{ width: 32, height: 32 }}
          contentFit="contain"
        />
      ) : (
        <Image
          source={messageLight}
          style={{ width: 32, height: 32 }}
          contentFit="contain"
        />
      ),
    "(profile)": (props: any) =>
      props.isFocused ? (
        <Image
          source={userDark}
          style={{ width: 32, height: 32 }}
          contentFit="contain"
        />
      ) : (
        <Image
          source={userLight}
          style={{ width: 32, height: 32 }}
          contentFit="contain"
        />
      ),
  };

  return (
    <TouchableOpacity
      style={styles.tabBarItem}
      onPress={onPress}
      // onLongPress={onLongPress}
    >
      {/*ICONS*/}
      <Animated.View
        style={[isFocused ? styles.iconContainer : {}, animatedIconStyle]}
      >
        {icons[route.name]({
          isFocused: isFocused,
        })}
      </Animated.View>

      {/*TROUGH*/}
      {/*{isFocused && (*/}

      {/*)}*/}

      {/*active color*/}
      {isFocused && (
        <Animated.Text
          style={[
            isFocused && {
              color: activeColor,
              marginTop: 10,
              fontWeight: "700",
            },
            animatedTextStyle,
          ]}
        >
          {label}
        </Animated.Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    // height: 70,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E1DAD5", // bg of the tab bar
    paddingVertical: 25,
    paddingHorizontal: 10,
    marginHorizontal: "auto",
    borderCurve: "continuous",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
    elevation: 3,
    // borderRadius: 25,
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

export default TabBarButton;
