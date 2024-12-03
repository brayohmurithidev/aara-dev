import { Avatar, MD3Colors, ProgressBar, Text } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthProvider.tsx";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useCallback, useLayoutEffect } from "react";
import { router, useNavigation } from "expo-router";
import { Colors } from "@/constants/Colors.ts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/initSupabase.ts";
import { profileAvatar } from "@/constants/images.ts";
import NotificationsBadge from "@/components/notificationsBadge.tsx";
import { FlashList } from "@shopify/flash-list";
import {
  useProgressHistory,
  useWorkoutHistories,
} from "@/services/reactQuery/queryHooks.ts";
import { MaterialIcons } from "@expo/vector-icons";

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

const Home = () => {
  const { signOut, user: currentUser } = useAuth();
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();
  const { workoutHistories, historiesFetching, historiesError } =
    useWorkoutHistories(5);
  const { progressHistory } = useProgressHistory();

  // GET UPDATED USER
  const {
    data: user,
    isLoading: userFetching,
    error: userError,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser?.id,
  });

  if (userError) {
    console.log({ userError });
  }

  useLayoutEffect(() => {
    if (currentUser) {
      navigation.setOptions({
        headerShown: true,
        headerShadowVisible: false,
        header: () => (
          <View
            style={{
              paddingHorizontal: 16,
              marginTop: Platform.OS === "android" ? top + 30 : top + 10,
              marginBottom: 16,
              paddingBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/*    left*/}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <TouchableOpacity onPress={() => router.push("/(profile)")}>
                <Avatar.Image
                  title="BM"
                  size={40}
                  rounded
                  containerStyle={{ backgroundColor: Colors.ecru800 }}
                  source={
                    user?.profile_image
                      ? { uri: user?.profile_image }
                      : profileAvatar
                  }
                  // containerStyle={{ backgroundColor: '#3d4db7' }}
                />
              </TouchableOpacity>

              <Text variant="titleMedium">
                Hello, {currentUser?.name?.split(" ")[0]}
              </Text>
              {/*<Heading size="xs">Welcome, Brian</Heading>*/}
            </View>
            {/*    right*/}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 20,
              }}
            >
              {/*<Feather name="search" size={21} />*/}

              {/*<SearchBar />*/}
              <NotificationsBadge />
            </View>
          </View>
        ),
      });
    }
  }, [navigation, currentUser, user]);

  // RENDER HISTORY
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
      <View style={styles.historyItem}>
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
      </View>
    );
  }, []);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <FlashList
        renderItem={({ item }) => <Text>{item}</Text>}
        estimatedItemSize={20}
        showsVerticalScrollIndicator={false}
        data={[]}
        ListHeaderComponent={() => (
          <>
            <View>
              <View style={styles.title}>
                <Text variant="titleLarge">Your Goal Progress</Text>
                {/*<Text>View details</Text>*/}
              </View>

              {progressHistory && progressHistory?.length > 0 ? (
                <View style={[styles.goalsCard, { height: 150 }]}>
                  {/*{progressHistory[0]?.workout?.icon && (*/}
                  {/*  <Icon source={progressHistory[0]?.workout?.icon ||} />*/}
                  {/*)}*/}
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    {progressHistory[0]?.workout?.name}
                  </Text>
                  <View style={styles.addGoal}>
                    <Text variant="titleMedium">Time</Text>
                    {/*<Text>{progressHistory[0]?.workout?.}</Text>*/}
                    <Text style={styles.historyDetails}>
                      {progressHistory[0]?.noOfDays
                        ? `${progressHistory[0]?.noOfDays} days`
                        : ""}
                      {progressHistory[0]?.duration?.hours
                        ? ` | ${progressHistory[0]?.duration.hours} Hours`
                        : ""}
                      {progressHistory[0]?.duration?.minutes
                        ? ` ${progressHistory[0]?.duration.minutes} Minutes`
                        : ""}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.goalsCard}>
                  <Text variant="bodyMedium" style={styles.cardTitle}>
                    Your Goal(s)
                  </Text>
                  <View style={[styles.addGoal, { alignItems: "center" }]}>
                    <TouchableOpacity onPress={() => router.push("/(workout)")}>
                      <MaterialIcons name="add-circle" size={48} />
                    </TouchableOpacity>

                    <Text variant="bodyMedium">Set Goal</Text>
                  </View>
                </View>
              )}
            </View>
            <View>
              <View
                style={[
                  styles.goalsCard,
                  { backgroundColor: "#459A80", height: 173 },
                ]}
              >
                <Text
                  variant="titleLarge"
                  style={[styles.cardTitle, { color: "#fff" }]}
                >
                  Workout Duration
                </Text>
                {progressHistory && progressHistory?.length > 0 ? (
                  <View style={styles.addGoal}>
                    <ProgressBar progress={0.5} color={MD3Colors.accent0} />
                    {/*<Heading size="xs" style={{ color: "#fff" }}>*/}
                    {/*  Progress*/}
                    {/*</Heading>*/}
                    {/*<LinearProgress*/}
                    {/*  value={0.5}*/}
                    {/*  variant="determinate"*/}
                    {/*  style={{ height: 8, marginVertical: 16 }}*/}
                    {/*  // trackColor={"green"}*/}
                    {/*  color="#fff"*/}
                    {/*/>*/}
                  </View>
                ) : (
                  <View style={[styles.addGoal, { alignItems: "center" }]}>
                    <MaterialIcons name="add-circle" size={48} color={"#fff"} />
                    <Text variant="bodyMedium" style={{ color: "#fff" }}>
                      Set Goal
                    </Text>
                  </View>
                )}
              </View>
              {workoutHistories && (
                <>
                  <View style={styles.title}>
                    <Text variant="bodyMedium">Workout History</Text>
                  </View>
                  <View>
                    <FlashList
                      data={workoutHistories}
                      // data={[]}
                      renderItem={renderWorkoutHistory}
                      // keyExtractor={(item) => item.name}
                      estimatedItemSize={200}
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
                          <Text>
                            No workouts yet, start today and track your progress
                            here
                          </Text>
                        </View>
                      )}
                      ListFooterComponent={() => (
                        <View style={{ height: 100 }}></View>
                      )}
                    />
                  </View>
                </>
              )}
            </View>
            {/*{currentUser && (*/}
            {/*  <ProfileCompletionPrompt currentUser={currentUser} />*/}
            {/*)}*/}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  title: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  goalsCard: {
    height: 232,
    padding: 16,
    backgroundColor: "#DFE0F9",
    borderRadius: 8,
    marginBottom: 16,
  },
  cardTitle: {
    alignSelf: "flex-start",
  },
  addGoal: {
    flex: 1,
    justifyContent: "center",
    // alignItems: "center",
  },
  workoutHistory: {
    minHeight: 141,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
    padding: 42,
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

export default Home;
