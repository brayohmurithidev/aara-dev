import { Platform, Pressable, StyleSheet, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import {
  getDataFromAsyncStorage,
  storeToAsyncStorage,
} from "@/utils/asyncStore.ts";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import Constants from "expo-constants";
import { Button, Text } from "react-native-paper";

const exercises = [
  { id: 1, title: "Yoga" },
  { id: 2, title: "Pilates" },
  { id: 3, title: "Running" },
  { id: 4, title: "Weight Training" },
  { id: 5, title: "Tennis" },
  { id: 6, title: "Swimming" },
  { id: 7, title: "Cycling" },
];

const WorkoutPreference = () => {
  const selectedExercisesRef = useRef<string[]>([]);
  const [error, setError] = useState("");

  // LOAD STATE INITIAL
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedValues = await getDataFromAsyncStorage("preferences");
        if (storedValues) {
          selectedExercisesRef.current = storedValues;
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  // HANDLE NEXT
  const handleNext = async () => {
    if (selectedExercisesRef.current.length === 0) {
      setError("Please select at least one workout preference");
    } else {
      console.log("Current ref", selectedExercisesRef.current);
      try {
        await storeToAsyncStorage("preferences", selectedExercisesRef.current);
        router.push("/fitnessGoal");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const ExerciseItem = ({ item }: { item: { title: string; id: number } }) => {
    const [isSelected, setIsSelected] = useState(
      selectedExercisesRef.current.includes(item.title),
    );

    const handlePress = () => {
      if (isSelected) {
        selectedExercisesRef.current = selectedExercisesRef.current.filter(
          (selected) => selected !== item.title,
        );
      } else {
        selectedExercisesRef.current.push(item.title);
      }
      setIsSelected(!isSelected); // Toggle local state without rerendering the whole list
    };

    return (
      <Pressable
        style={[
          styles.fitnessWrapper,
          isSelected && {
            borderWidth: 2,
            backgroundColor: "#FFF4D6",
          },
        ]}
        onPress={handlePress}
      >
        <Text style={{ fontSize: 18, color: "#201C1C", fontWeight: "400" }}>
          {item.title}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          paddingTop:
            Platform.OS === "android" && Constants.statusBarHeight + 24,
        },
      ]}
    >
      <FlashList
        data={exercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ExerciseItem item={item} />}
        estimatedItemSize={50}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            <Text variant="titleMedium" style={styles.title}>
              Almost Done! Choose Your Preferred Workout Type
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
              Select all that apply
            </Text>
          </View>
        )}
        ListFooterComponent={() => (
          <>
            <Text style={styles.errorText}>{error}</Text>
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
                fill={75}
                tintColor="#201C1C"
                backgroundColor="#E4E4E4"
              >
                {() => (
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                    3 / 4
                  </Text>
                )}
              </AnimatedCircularProgress>

              <Button
                mode="contained"
                style={{ width: 120 }}
                onPress={handleNext}
                buttonTextStyles={{ fontSize: 18 }}
                // disabled={selectedExercisesRef.current.length === 0}
                icon="arrow-right"
              >
                Next
              </Button>
            </View>
          </>
        )}
      />
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
    height: 48,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    marginBottom: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "red",
    marginTop: 5,
    fontSize: 14,
  },
});

export default WorkoutPreference;
