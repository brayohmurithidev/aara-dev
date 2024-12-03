import React, { useRef, useState } from "react";
import { Dimensions, FlatList, Platform, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { intro1, intro2, intro3 } from "@/constants/images.ts";
import { ImageBackground } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/Colors.ts";
import Constants from "expo-constants";
import { Button, Text } from "react-native-paper";

type ItemProps = {
  item: {
    image: any;
    title: string;
  };
};

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Find your perfect workout partner and stay motivated together!",
    image: intro1, // Your image path here
  },
  {
    id: "2",
    title: "Achieve your fitness goals and stay on track!",

    image: intro2, // Your image path here
  },
  {
    id: "3",
    title:
      "Stay healthier and live happier make workouts a part of your routine!",

    image: intro3, // Your image path here
  },
];

const IntroScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef();

  // @ts-ignore
  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const renderItem = ({ item }: ItemProps) => (
    <ImageBackground source={item.image} style={styles.backgroundImage}>
      {/*<LottieView />*/}
      <View style={styles.overlay}>
        <View style={styles.overlayContent}>
          <Text style={styles.title}>{item.title}</Text>
          {/*<Text style={styles.description}>{item.description}</Text>*/}
          {renderIndicator()}
        </View>
      </View>
    </ImageBackground>
  );

  const renderIndicator = () => {
    return (
      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentIndex
                ? styles.activeIndicator
                : styles.inactiveIndicator,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <>
      <SafeAreaView
        edges={[]}
        style={[
          styles.container,
          {
            paddingTop: Platform.OS === "android" && Constants.statusBarHeight,
          },
        ]}
      >
        <FlatList
          data={slides}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          // @ts-ignore
          ref={flatListRef}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
        />

        <View style={styles.buttonContainer}>
          <Button
            style={styles.getStartedButton}
            buttonTextStyles={styles.getStartedText}
            onPress={() => router.push("/register")}
            title=""
          >
            GET STARTED
          </Button>
        </View>
      </SafeAreaView>
      <StatusBar
        hideTransitionAnimation="fade"
        translucent={true}
        backgroundColor={Colors.baseWhite}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: width,
    height: height,
    justifyContent: "center", // Ensures the text aligns towards the bottom of the screen
  },
  overlay: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0000004D",
  },
  overlayContent: {
    position: "absolute",
    bottom: "30%",
    padding: 20,
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
    marginTop: 10,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
  },
  getStartedButton: {
    backgroundColor: "#fff",
    width: "80%",
    justifyContent: "center",
  },
  getStartedText: {
    color: "#000",
    fontSize: 18,
  },
  indicatorContainer: {
    flexDirection: "row",
    marginTop: 24,
    justifyContent: "center",
    // position: "absolute",
    // bottom: "38%",
    width: "100%",
  },
  indicator: {
    height: 3,
    width: 12,
    // borderRadius: 5,
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: "#fff",
    width: 30,
  },
  inactiveIndicator: {
    backgroundColor: "#D3D3D3",
  },
});

export default IntroScreen;
