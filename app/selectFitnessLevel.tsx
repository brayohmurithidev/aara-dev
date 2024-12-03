import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import {
  getDataFromAsyncStorage,
  storeToAsyncStorage,
} from "@/utils/asyncStore.ts";
import { router } from "expo-router";
import Constants from "expo-constants";
import { Button, Text } from "react-native-paper";

const levels = [
  {
    title: "Beginner",
    description: "Starting out or getting back into fitness",
  },
  {
    title: "Intermediate",
    description: "You've got some experiences and are building strength",
  },
  {
    title: "Advanced",
    description: "You're fit and ready to take on challenging workouts.",
  },
];

const FitnessLevel = () => {
  const [selectedLevel, setSelectedLevel] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [error, setError] = useState("");
  const progressRef = useRef(null);

  const handleSelectLevelChange = (level: {
    title: string;
    description: string;
  }) => {
    console.log(level);
    setSelectedLevel(level);
  };

  // LOAD STATE INITIAL
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedValues = await getDataFromAsyncStorage("fitnessLevel");
        if (storedValues) {
          setSelectedLevel(storedValues);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  // HANDLE NEXT
  const handleNext = async () => {
    if (!selectedLevel) {
      setError("PLease select your workout level");
    } else {
      try {
        await storeToAsyncStorage("fitnessLevel", selectedLevel);
        router.push("/workoutPreference");
      } catch (error) {
        console.log(error);
      }
    }
  };

  // @ts-ignore
  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.container,
        {
          paddingTop:
            Platform.OS === "android" && Constants.statusBarHeight + 24,
        },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/*  UPPER WRAPPER*/}
        <View>
          <Text variant="titleMedium" style={styles.title}>
            Select your Fitness Level
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              marginTop: 10,
              marginBottom: 28,
              width: "90%",
              textAlign: "center",
              marginHorizontal: "auto",
            }}
          >
            Choose the option that best matches your fitness level to customize
            your workout plan
          </Text>
          {levels?.map((level, index) => (
            <Pressable
              key={index}
              style={[
                styles.fitnessWrapper,
                selectedLevel &&
                  level?.title === selectedLevel?.title && {
                    borderWidth: 2,
                    // borderColor: Colors.mainButtonBackground,
                    backgroundColor: "#FFF4D6",
                  },
              ]}
              onPress={() => handleSelectLevelChange(level)}
            >
              <Text
                style={{ fontSize: 18, color: "#201C1C", fontWeight: "400" }}
              >
                {level.title}
              </Text>
              <Text style={{ fontSize: 16, color: "#655F5F" }}>
                {level.description}
              </Text>
            </Pressable>
          ))}

          <Text style={styles.errorText}>{error}</Text>
        </View>
        <View
          style={{
            marginBottom: 24,
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 56,
          }}
        >
          <AnimatedCircularProgress
            size={70}
            width={10}
            fill={50}
            tintColor="#201C1C"
            backgroundColor="#E4E4E4"
          >
            {() => (
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>2 / 4</Text>
            )}
          </AnimatedCircularProgress>

          <Button
            style={{ width: 120 }}
            onPress={handleNext}
            buttonTextStyles={{ fontSize: 18 }}
            // disabled={!selectedLevel}
            icon="arrow-right"
            mode="contained"
          >
            Next
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  title: {
    textAlign: "center",
  },
  fitnessWrapper: {
    width: "100%",
    height: 102,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    marginBottom: 20,
    borderRadius: 8,
    padding: 16,
  },
  errorText: {
    color: "red",
    marginTop: 5,
    fontSize: 14,
  },
});

export default FitnessLevel;
