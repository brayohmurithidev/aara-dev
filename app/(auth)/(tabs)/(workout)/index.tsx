import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router, useNavigation } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { MaterialIcons } from "@expo/vector-icons";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/initSupabase.ts";
import { useWorkoutHistories } from "@/services/reactQuery/queryHooks.ts";
import { Text } from "react-native-paper";
// import Input from "@/components/input";

// Workout types with corresponding colors based on their meaning
const workoutTypes = [
  { id: 1, icon: "self-improvement", title: "Yoga", color: "#CBE56D" }, // Calm, refreshing
  { id: 2, icon: "directions-run", title: "Running", color: "#BDE1D6" }, // Energizing
  { id: 3, icon: "fitness-center", title: "Weight Training", color: "#CFC4BD" }, // Strength
  { id: 4, icon: "pool", title: "Swimming", color: "#7BC4AD" }, // Cool, fluid
  { id: 5, icon: "directions-bike", title: "Cycling", color: "#BEC1F3" }, // Dynamic, active
  { id: 6, icon: "self-improvement", title: "Pilates", color: "#F7C6BF" }, // Balanced, soothing
  { id: 7, icon: "sports-tennis", title: "Tennis", color: "#F4C790" }, // Focus, agility
];

const workoutHistory = [
  {
    workoutTypeId: 1,
    calories: "300 kcal",
    time: "45 mins",
  },
  {
    workoutTypeId: 3,
    calories: "500 kcal",
    time: "1 hour",
  },
  { workoutTypeId: 7, calories: "400 kcal", time: "30 mins" },
  // Add more history items here
];

const colors = [
  "#CBE56D",
  "#BDE1D6",
  "#CFC4BD",
  "#7BC4AD",
  "#BEC1F3",
  "#F7C6BF",
  "#F4C790",
];
let lastColor: string | null = null;

const Workout = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { top, bottom } = useSafeAreaInsets();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState(null);

  const { workoutHistories, historiesError, historiesFetching } =
    useWorkoutHistories();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: "Workout",
      headerSearchBarOptions: {
        placeholder: "Search workout",
        inputType: "text",
        onChangeText: (event: any) => {
          setSearchTerm(event.nativeEvent.text);
        },
      },

      // headerTransparent: false,
    });
  }, [navigation, openCreateModal]);

  // QUERY WORKOUTS
  const {
    data: workouts,
    error,
    isLoading: workoutsLoading,
  } = useQuery({
    queryKey: ["workoutTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workouts")
        .select("id, name, icon");
      // .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Filter workouts based on search term
  const filteredWorkouts = useMemo(() => {
    if (workouts)
      return workouts.filter((workout) =>
        workout.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
  }, [workouts, searchTerm]);

  const renderWorkoutType = useCallback(
    ({ item }) => {
      let randomColor;

      // Ensure the color is not the same as the last color used
      do {
        randomColor = colors[Math.floor(Math.random() * colors.length)];
      } while (randomColor === lastColor);

      // Update lastColor with the current random color
      lastColor = randomColor;

      return (
        <TouchableOpacity
          style={[styles.card, { backgroundColor: randomColor }]}
          onPress={() => {
            router.push({
              pathname: "/addWorkoutModal",
              params: { item: JSON.stringify({ ...item }) },
            });
            // setSelectedWorkoutType(item);
            // setOpenCreateModal(true);
          }}
        >
          <MaterialIcons name={item.icon} size={40} color="#000" />
          <Text style={styles.cardTitle}>{item.name}</Text>
        </TouchableOpacity>
      );
    },
    [setSelectedWorkoutType, setOpenCreateModal],
  );

  const renderWorkoutHistory = useCallback(({ item }) => {
    const { workout, duration, noOfDays, status } = item;

    let randomColor;

    // Ensure the color is not the same as the last color used
    do {
      randomColor = colors[Math.floor(Math.random() * colors.length)];
    } while (randomColor === lastColor);

    // Update lastColor with the current random color
    lastColor = randomColor;

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/progressUpdate",
            params: {
              item: JSON.stringify(item),
            },
          })
        }
        style={styles.historyItem}
      >
        <View style={styles.historyInfo}>
          <MaterialIcons
            name={workout?.icon}
            size={40}
            color="#000"
            style={{
              backgroundColor: randomColor,
              borderRadius: 360,
              padding: 2,
            }}
          />
          <View style={styles.historyTextContainer}>
            <Text style={styles.historyTitle}>{workout?.name}</Text>
            <View
              style={{
                flexDirection: "row",
                // justifyContent: "space-between",
                gap: 24,

                // flex: 1,
              }}
            >
              <Text style={styles.historyDetails}>
                {noOfDays ? `${noOfDays} days` : ""}
                {duration?.hours ? ` | ${duration.hours} Hours` : ""}
                {duration?.minutes ? ` ${duration.minutes} Minutes` : ""}
              </Text>
              <View
                style={[
                  {
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 30,
                  },
                  status === "not started"
                    ? { backgroundColor: "#CFC4BD" }
                    : status === "on progress"
                      ? { backgroundColor: "#F7C6BF" }
                      : { backgroundColor: "#7BC4AD" },
                ]}
              >
                <Text style={styles.historyDetails}>{status}</Text>
              </View>
            </View>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#ccc" />
      </TouchableOpacity>
    );
  }, []);

  if (workoutsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    // @ts-ignore
    <SafeAreaView
      edges={[]}
      style={[
        styles.container,
        // { paddingTop: Platform.OS === "android" && Constants.statusBarHeight },
      ]}
    >
      <FlashList
        contentInsetAdjustmentBehavior="automatic"
        data={[]}
        renderItem={null}
        estimatedItemSize={50}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            <Text style={styles.sectionTitle}>Workout Type</Text>
            {/*{workoutsLoading && <ActivityIndicator size="large" />}*/}
            {workouts && workouts.length > 0 && (
              <FlashList
                data={filteredWorkouts}
                // extraData={searchTerm}
                horizontal
                renderItem={renderWorkoutType}
                keyExtractor={(item) => item.name}
                estimatedItemSize={124}
                contentContainerStyle={styles.workoutTypeList}
                showsHorizontalScrollIndicator={false}
                // onLoad={workoutsLoading}
              />
            )}

            <Text style={[styles.sectionTitle, {}]}>Workout History</Text>
            {/*{historiesFetching && <ActivityIndicator size="large" />}*/}
            {workoutHistories && workoutHistories.length > 0 && (
              <FlashList
                data={workoutHistories}
                // data={[]}
                renderItem={renderWorkoutHistory}
                // keyExtractor={(item) => item.name}
                estimatedItemSize={80}
                contentContainerStyle={styles.workoutHistoryList}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={() => (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      width: "80%",
                      marginHorizontal: "auto",
                      paddingVertical: 16,
                    }}
                  >
                    <Text style={{ textAlign: "center" }}>
                      No workouts yet, start today and track your progress here!
                    </Text>
                  </View>
                )}
              />
            )}
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
  },
  sectionTitle: {
    fontWeight: "900",
    fontSize: 18,
    lineHeight: 21,
    marginBottom: 16,
  },
  workoutTypeList: {
    paddingBottom: 40,
    // marginBottom: 40,
  },
  card: {
    width: 124,
    height: 124,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  workoutHistoryList: {
    // paddingTop: 16,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  historyInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyTextContainer: {
    marginLeft: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  historyDetails: {
    fontSize: 14,
    color: "#888",
  },
});

export default Workout;
