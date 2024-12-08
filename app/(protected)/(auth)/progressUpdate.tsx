import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors.ts";
import { Feather } from "@expo/vector-icons";

import { supabase } from "@/config/initSupabase.ts";
import { Button, Text } from "react-native-paper";
import { Pedometer } from "expo-sensors";
// import { supabase } from "@config/initSupabase"; // Import the Supabase client

const ProgressUpdate = () => {
  const { item } = useLocalSearchParams();
  const workout = JSON.parse(item);
  const { top } = useSafeAreaInsets();

  // console.log({ workout });

  // State variables
  const [stepCount, setStepCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Fetch existing progress if available
  const existingProgress = workout?.existingProgress || { steps: 0, time: 0 }; // Replace with actual data fetching
  const initialSteps = existingProgress.steps;
  const initialTime = existingProgress.time;

  // Calculate target time in seconds based on duration and noOfDays
  const durationInSeconds =
    (workout?.duration?.hours || 0) * 3600 +
    (workout?.duration?.minutes || 0) * 60;

  const totalTargetSeconds = durationInSeconds * (workout?.noOfDays || 1); // Adjust for number of days

  // Calculate remaining time
  const totalTime = initialTime + seconds; // Include time from previous progress
  const remainingTime = Math.max(totalTargetSeconds - totalTime, 0);

  // Convert remaining and total target time into hours and minutes
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return { hours, minutes };
  };

  const targetTime = formatTime(totalTargetSeconds);
  const remainingFormattedTime = formatTime(remainingTime);

  // Check if workout type is walking or running
  const isStepBasedWorkout = ["walking", "running"].includes(
    workout?.workout?.name?.toLowerCase(),
  );

  // Start/stop logic for step counter or stopwatch
  useEffect(() => {
    if (isStepBasedWorkout) {
      const subscribe = Pedometer.watchStepCount((result) => {
        setStepCount(initialSteps + result.steps); // Update with initial steps
      });
      return () => subscribe.remove();
    }
  }, [isStepBasedWorkout]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  // Handle start/pause timer
  const handleStartStop = () => setIsActive(!isActive);

  // Reset timer and steps
  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
    setStepCount(initialSteps); // Reset to initial steps
  };

  // Function to handle saving progress
  const handleSaveProgress = async () => {
    const progressData = {
      progress: {
        hours: stepCount,
        minutes: totalTime, // Total time including existing progress
      },
    };

    try {
      const { data, error } = await supabase
        .from("user_workouts") // Ensure this matches your Supabase table name
        .update({ ...progressData }) // Update the existing entry
        .eq("id", workout.id); // Replace with the actual identifier for the workout progress
      // .eq("user_id", "YOUR_USER_ID"); // Ensure you're updating the correct user's workout

      if (error) {
        throw error; // Throw error to be caught in the catch block
      }

      console.log("Progress updated:", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to update progress:", error.message);
    }
  };

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[
        styles.container,
        { paddingTop: Platform.OS === "android" && top + 24 },
      ]}
    >
      {/* Top Section */}
      <View style={styles.topSection}>
        {/*<Icon*/}
        {/*  name={workout?.workout?.icon}*/}
        {/*  type="material"*/}
        {/*  color={"red"}*/}
        {/*  size={40}*/}
        {/*/>*/}
        <Text variant="displayMedium">{workout?.workout?.name}</Text>
        <Text style={styles.subTitle}>Start your progress tracking</Text>
        <Text style={styles.targetText}>
          Target: {targetTime.hours}h {targetTime.minutes}m
        </Text>
        <Text style={styles.targetText}>
          Remaining: {remainingFormattedTime.hours}h{" "}
          {remainingFormattedTime.minutes}m
        </Text>
      </View>

      {/* Middle Section */}
      <View style={styles.middleSection}>
        {isStepBasedWorkout ? (
          <>
            <Text style={styles.counterText}>Steps: {stepCount}</Text>
            <Text style={styles.counterText}>
              Time: {Math.floor(totalTime / 60)}:{totalTime % 60}
            </Text>
          </>
        ) : (
          <Text style={styles.counterText}>
            Time: {Math.floor(totalTime / 60)}:{totalTime % 60}
          </Text>
        )}
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <Button
          mode="outlined"
          icon="undo"
          onPress={handleReset}
          buttonStyle={styles.resetButton}
          style={{ padding: 10 }}
        >
          Reset
        </Button>
        <TouchableOpacity
          onPress={handleStartStop}
          style={{
            width: 100,
            height: 100,
            borderWidth: 2,
            borderRadius: 360,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name={isActive ? "pause" : "play"} size={40} color="red" />
        </TouchableOpacity>

        <Button
          mode="contained"
          icon="content-save"
          style={{
            paddingVertical: 10,
            paddingHorizontal: 10,
          }}
          onPress={handleSaveProgress}
          disabled={isActive}
          buttonStyle={styles.saveButton}
        >
          Save
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.softLime,
    justifyContent: "space-between",
  },
  topSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 16,
    color: Colors.darkGrey,
  },
  targetText: {
    fontSize: 16,
    color: Colors.secondary,
    marginVertical: 4,
  },
  middleSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  counterText: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.primary,
    marginVertical: 8,
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  resetButton: {
    backgroundColor: Colors.red,
    paddingHorizontal: 20,
  },
  saveButton: {
    paddingHorizontal: 20,
  },
});

export default ProgressUpdate;
