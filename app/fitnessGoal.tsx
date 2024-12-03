import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors.ts";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import {
  getDataFromAsyncStorage,
  storeToAsyncStorage,
} from "@/utils/asyncStore.ts";
import Modal from "@/components/modal.tsx";
// import {createUserEmailPassword, saveUserData, uploadProfileImage,} from "@/firebase/firebase.fns";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import Constants from "expo-constants";
import { Button, Text } from "react-native-paper";

const goals = [
  { id: 1, title: "Weight Loss" },
  { id: 2, title: "Stay Active" },
  { id: 3, title: "Weight Lifter" },
  { id: 4, title: "Get Ripped" },
];

const FitnessGoal = () => {
  const selectedGoalsRef = useRef<string[]>([]);
  const [error, setError] = useState("");
  const [openLoadModal, setOpenLoadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedValues = await getDataFromAsyncStorage("goals");
        if (storedValues) {
          selectedGoalsRef.current = storedValues;
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async () => {
    if (selectedGoalsRef.current.length === 0) {
      setError("Please select at least one workout preference");
    } else {
      await storeToAsyncStorage("goals", selectedGoalsRef.current);
      router.push("/partnerPreferences");
    }
  };

  const ExerciseItem = ({ item }: { item: { title: string; id: number } }) => {
    const [isSelected, setIsSelected] = useState(
      selectedGoalsRef.current.includes(item.title),
    );

    const handlePress = () => {
      if (isSelected) {
        selectedGoalsRef.current = selectedGoalsRef.current.filter(
          (selected) => selected !== item.title,
        );
      } else {
        selectedGoalsRef.current.push(item.title);
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
        data={goals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ExerciseItem item={item} />}
        estimatedItemSize={50}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            <Text variant="titleMedium" style={styles.title}>
              Select Your Fitness Goal
            </Text>
            <Text
              variant="titleMedium"
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
                marginBottom: 100,
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 56,
              }}
            >
              <AnimatedCircularProgress
                size={70}
                width={10}
                fill={100}
                tintColor="#201C1C"
                backgroundColor="#E4E4E4"
              >
                {() => (
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                    4 / 4
                  </Text>
                )}
              </AnimatedCircularProgress>

              <Button
                mode="contained"
                style={{ width: 120 }}
                onPress={handleSubmit}
                buttonTextStyles={{ fontSize: 18 }}
                // disabled={selectedGoalsRef.current.length === 0}
                icon="arrow-right"
              >
                Next
              </Button>
            </View>
          </>
        )}
      />

      <Modal
        visible={openLoadModal}
        onClose={() => null}
        title="Setting up your account"
      >
        <View style={{ alignItems: "center" }}>
          <ActivityIndicator size={90} color={Colors.mainButtonBackground} />
          <Text style={{ textAlign: "center", marginTop: 24 }}>
            Getting things ready
          </Text>
        </View>
      </Modal>
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

export default FitnessGoal;
