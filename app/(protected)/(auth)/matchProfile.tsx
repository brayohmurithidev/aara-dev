import React, {useEffect, useState} from "react";
import {SafeAreaView, useSafeAreaInsets,} from "react-native-safe-area-context";
import {Platform, StyleSheet, View} from "react-native";
import {Colors} from "@/constants/Colors.ts";
import BackButton from "@/components/backButton.tsx";
import {Feather} from "@expo/vector-icons";
import {ImageBackground} from "expo-image";
import {profileAvatar, workoutLadies} from "@/constants/images.ts";
import {StatusBar} from "expo-status-bar";
import {Link, router, useLocalSearchParams} from "expo-router";
// import { calculateAgeFromDate } from "@/app/(auth)/(tabs)/entry.tsx";
import {FlashList} from "@shopify/flash-list";
import FitnessSpots from "@/components/fitnessSpots.tsx";
import {supabase} from "@/config/initSupabase.ts";
import Toast from "react-native-root-toast";
import {useAuth} from "@/context/AuthProvider.tsx";
import * as Location from "expo-location";
import {Avatar, Button, Text} from "react-native-paper";
import {calculateAgeFromDate} from "@/app/(protected)/(auth)/(tabs)/(profile)/index.tsx";

const getGymsNearby = async () => {
  // Fetch user's location and nearby gyms
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.log("Permission denied");
    return;
  }
  const location = await Location.getCurrentPositionAsync();
  const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_KEY;
  const { latitude, longitude } = location.coords;

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=gym&key=${googleApiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return data.results?.map((gym) => ({
      name: gym.name,
      address: gym.vicinity,
      rating: gym.rating,
      id: gym.place_id,
      image: gym.photos?.[0]?.photo_reference, // Optional image placeholder
    }));
  } catch (error) {
    console.error("Error fetching gyms:", error);
  }
};

const markers = [
  {
    latlng: { latitude: 37.78825, longitude: -122.4324 },
    title: "Marker 1",
    description: "This is the description for marker 1",
  },
  {
    latlng: { latitude: 37.68925, longitude: -122.4334 },
    title: "Marker 2",
    description: "This is the description for marker 2",
  },
  {
    latlng: { latitude: 37.79025, longitude: -122.38964 },
    title: "Marker 3",
    description: "This is the description for marker 3",
  },
  {
    latlng: { latitude: 37.79125, longitude: -122.3354 },
    title: "Marker 4",
    description: "This is the description for marker 4",
  },
  {
    latlng: { latitude: 37.69225, longitude: -122.4364 },
    title: "Marker 5",
    description: "This is the description for marker 5",
  },
];

const MatchProfile = () => {
  const { top, bottom } = useSafeAreaInsets();
  const { matchProfile }: { matchProfile: any } = useLocalSearchParams();
  const userData = JSON.parse(matchProfile);
  console.log({ userData });
  const [isLoading, setIsLoading] = useState(false);
  const [matchingLoading, setMatchingLoading] = useState(true);
  const [isMatching, setIsMatching] = useState<object | null>(null);
  const {
    user: { id: userId },
  } = useAuth();

  const [gyms, setGyms] = useState([]);

  useEffect(() => {
    const fetchGyms = async () => {
      const gymsData = await getGymsNearby();

      setGyms(gymsData);
    };
    fetchGyms();
  }, []);

  // CHECK IF MATCHED ALREADY
  const checkMatchStatus = async (user1Id: string, user2Id: string) => {
    try {
      setMatchingLoading(true);
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select("id, match_status")
        .or(
          `and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`,
        );

      if (error) {
        console.log("Error checking match status: ", error);
        throw error;
      }

      //   IF CONVERSATIONS EXISTS
      if (conversations && conversations.length > 0) {
        setIsMatching({
          matched: true,
          matchStatus: conversations[0].match_status,
        });
      } else {
        setIsMatching({
          matched: false,
          matchStatus: "Not Matched",
        });
      }
      return;
    } catch (error) {
      console.error("Error checking match status: ", error);
    } finally {
      setMatchingLoading(false);
    }
  };

  useEffect(() => {
    checkMatchStatus(userId, userData?.id);
  }, []);

  // handle matching
  const handleMatching = async (currentUserId: string, otherUserId: string) => {
    //   user1_id, user2_id, initiator_id, match_status
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("conversations").insert({
        user1_id: currentUserId,
        user2_id: otherUserId,
        initiator_id: currentUserId,
        match_status: "pending",
      });
      if (error) {
        if (error?.code === "23505") {
          throw new Error("Match already created");
        }
        throw error;
      }
      router.push("/matchingRequestModal");
      return data;
    } catch (error) {
      console.error({ "matching error": error });

      Toast.show(error?.message, {
        duration: Toast.durations.LONG,
        position: Toast.positions.TOP,
        backgroundColor: Colors.red,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      edges={["right", "left"]}
      style={[styles.container, { marginBottom: bottom }]}
    >
      <FlashList
        renderItem={({ item }) => console.log(item)}
        estimatedItemSize={50}
        ListHeaderComponent={() => (
          <>
            <ImageBackground
              source={
                userData?.profile_image
                  ? { uri: userData?.profile_image }
                  : workoutLadies
              }
              style={{ width: "100%", height: 285 }}
            >
              <BackButton
                buttonStyles={{
                  backgroundColor: "#fff",
                  borderRadius: 360,
                  width: 40,
                  height: 40,
                  position: "absolute",
                  top: 16,
                  left: 16,
                }}
              />
            </ImageBackground>

            <View style={{ paddingHorizontal: 16, position: "relative" }}>
              {/*<View*/}
              {/*  style={{*/}
              {/*    width: 150,*/}
              {/*    height: 150,*/}
              {/*    backgroundColor: "green",*/}
              {/*    position: "absolute",*/}
              {/*    top: -75,*/}
              {/*    left: 16,*/}
              {/*    borderRadius: 360,*/}
              {/*    borderWidth: 3,*/}
              {/*    bottom: 0,*/}
              {/*    borderColor: Colors.mainBackground,*/}
              {/*  }}*/}
              {/*>*/}
              <Avatar.Image
                source={
                  userData?.profile_image
                    ? { uri: userData?.profile_image }
                    : profileAvatar
                }
                // avatarStyle={{ width: "100%", height: "100%" }}
                style={{
                  backgroundColor: "green",
                  position: "absolute",
                  top: -75,
                  left: 16,
                  borderRadius: 360,
                  borderWidth: 3,
                  bottom: 0,
                  borderColor: Colors.mainBackground,
                }}
                size={100}
                // contentFit="cover"
              />
              {/*</View>*/}
              {/*  MAIN CONTENT*/}
              <View style={{ marginTop: 40 }}>
                <Text variant="titleMedium">{userData?.name}</Text>
                <View
                  style={{
                    marginTop: 6,
                    flexDirection: "row",
                    gap: 6,
                    alignItems: "center",
                    marginBottom: 28,
                  }}
                >
                  {userData?.city && <Feather name="map-pin" size={20} />}
                  {userData?.city && <Text>{userData?.city}</Text>}
                  <Feather name="x-circle" size={10} />
                  <Text>
                    {calculateAgeFromDate(userData?.birthday)} Years old
                  </Text>
                </View>

                {/*    BIO*/}
                {userData?.bio && (
                  <View style={{ marginBottom: 28 }}>
                    <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                      Bio
                    </Text>
                    <Text>{userData?.bio}</Text>
                  </View>
                )}

                {gyms && (
                  <View style={{ marginBottom: 28 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                        Fitness Spot
                      </Text>
                      <Link href="/gymsNearMe">See more</Link>
                    </View>

                    <FitnessSpots gyms={gyms} />
                  </View>
                )}

                {/*    GOALS BADGES*/}
                {userData?.badges && (
                  <View style={{ marginBottom: 28 }}>
                    <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                      Goal Badges
                    </Text>
                    <Text>
                      Fitness enthusiast on a journey to stay active, healthy,
                      and strong. Let's crush our goals together
                    </Text>
                  </View>
                )}
                {/*    Gender*/}
                {userData?.gender && (
                  <View style={{ marginBottom: 28 }}>
                    <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                      Gender
                    </Text>
                    <Text
                      style={{
                        backgroundColor: "#E4E4E4",
                        padding: 10,
                        alignSelf: "flex-start",
                        borderRadius: 8,
                      }}
                    >
                      {userData?.gender}
                    </Text>
                  </View>
                )}

                {/*    FItness level*/}
                {userData?.fitness_level && (
                  <View style={{ marginBottom: 28 }}>
                    <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                      Fitness Level
                    </Text>
                    <Text
                      style={{
                        backgroundColor: "#E4E4E4",
                        padding: 10,
                        alignSelf: "flex-start",
                        borderRadius: 8,
                      }}
                    >
                      {userData?.fitness_level}
                    </Text>
                  </View>
                )}
                {/*    Availability */}
                {userData?.availability?.length > 0 && (
                  <View style={{ marginBottom: 28 }}>
                    <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                      Availability
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        flexWrap: "wrap",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      {userData?.availability?.map((availability: string) => (
                        <Text
                          key={availability}
                          style={{
                            backgroundColor: "#E4E4E4",
                            padding: 10,
                            alignSelf: "flex-start",
                            borderRadius: 8,
                          }}
                        >
                          {availability}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
                {/*    Workout type*/}
                {userData?.workout_type && (
                  <View style={{ marginBottom: 28, marginTop: 10 }}>
                    <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                      Workout Type
                    </Text>
                    <Text
                      style={{
                        backgroundColor: "#E4E4E4",
                        padding: 10,
                        alignSelf: "flex-start",
                        borderRadius: 8,
                      }}
                    >
                      {userData?.workout_type}
                    </Text>
                  </View>
                )}
                {/*    WORKOUT STYLE*/}
                {userData?.workout_style && (
                  <View style={{ marginBottom: 28, marginTop: 10 }}>
                    <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                      Workout Style
                    </Text>
                    <Text
                      style={{
                        backgroundColor: "#E4E4E4",
                        padding: 10,
                        alignSelf: "flex-start",
                        borderRadius: 8,
                      }}
                    >
                      {userData?.workout_style}
                    </Text>
                  </View>
                )}
                {/*    Fitness Goal*/}
                {userData?.fitness_goals && (
                  <View style={{ marginBottom: 28, marginTop: 10 }}>
                    <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                      Fitness Goal
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        flexWrap: "wrap",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      {userData?.fitness_goals?.map((goal: string) => (
                        <Text
                          key={goal}
                          style={{
                            backgroundColor: "#E4E4E4",
                            padding: 10,
                            alignSelf: "flex-start",
                            borderRadius: 8,
                          }}
                        >
                          {goal}
                        </Text>
                      ))}
                    </View>
                    <Text
                      style={{
                        backgroundColor: "#E4E4E4",
                        padding: 10,
                        alignSelf: "flex-start",
                        borderRadius: 8,
                      }}
                    >
                      {userData?.fitness_goals}
                    </Text>
                  </View>
                )}

                {/*    Prompt*/}
                {userData?.prompt && (
                  <View style={{ marginBottom: 28, marginTop: 10 }}>
                    <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                      Prompt
                    </Text>
                    <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
                      My ideal workout buddy is someone who
                    </Text>
                    <Text>
                      My ideal workout buddy is someone who is motivated,
                      supportive, and enjoys a good challenge. They keep me
                      accountable, share my fitness goals, and make workouts
                      fun.
                    </Text>
                  </View>
                )}
                {!matchingLoading && isMatching && (
                  <Button
                    mode="contained"
                    onPress={async () => {
                      if (isMatching?.matched) {
                        if (isMatching?.matchStatus === "pending") {
                          // Action for pending status, e.g., cancel match request
                          // handlePendingAction(userId, userData?.id);
                        } else if (isMatching?.matchStatus === "accepted") {
                          // Action for accepted status, e.g., unmatch
                          // handleUnmatch(userId, userData?.id);
                        } else if (isMatching?.matchStatus === "rejected") {
                          // Action for rejected status, e.g., retry match
                          // handleRetryMatch(userId, userData?.id);
                        }
                      } else {
                        // Action for initial matching
                        await handleMatching(userId, userData?.id);
                      }
                    }}
                    disabled={
                      isMatching?.matchStatus === "pending" ||
                      isMatching?.matchStatus === "accepted" ||
                      isMatching?.matchStatus === "rejected"
                    }
                    style={{
                      paddingVertical: 17,
                      marginBottom: Platform.OS === "android" && 24,
                    }}
                  >
                    {isMatching?.matched
                      ? isMatching?.matchStatus === "pending"
                        ? "Pending"
                        : isMatching?.matchStatus === "accepted"
                          ? "Unmatch"
                          : isMatching?.matchStatus === "rejected"
                            ? "Rejected"
                            : "Match Now"
                      : "Match Now"}
                  </Button>
                )}
              </View>
            </View>
          </>
        )}
      />
      {/*<ScrollView*/}
      {/*  contentContainerStyle={{ flexGrow: 1 }}*/}
      {/*  showsVerticalScrollIndicator={false}*/}
      {/*>*/}
      {/*  */}
      {/*</ScrollView>*/}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 16,
    backgroundColor: Colors.mainBackground,
  },
});

export default MatchProfile;
