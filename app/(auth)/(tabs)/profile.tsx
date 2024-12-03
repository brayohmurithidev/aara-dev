import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import React from "react";
import { ImageBackground } from "expo-image";
import { Colors } from "@/constants/Colors.ts";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { pickImage } from "@/utils/imagePicker.ts";
import { useAuth } from "@/context/AuthProvider.tsx";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/initSupabase.ts";
import { profileAvatar, workoutLadies } from "@/constants/images.ts";
import * as Location from "expo-location";
import { Avatar, Button, Text } from "react-native-paper";

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

const fetchFriendsList = async (userId: string | undefined) => {
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(
      `
        *,
        user1:profiles!user1_id(*),
        user2:profiles!user2_id(*)
      `,
    )
    .or(`user1_id.eq.${userId}, user2_id.eq.${userId}`)
    .eq("match_status", "accepted");

  if (error) {
    console.error("Error fetching friends list:", error);
    throw new Error("Could not fetch friends list");
  }

  return conversations.map((conversation) => {
    return conversation.user1_id === userId
      ? conversation.user2
      : conversation.user1;
  });
};

export const calculateAgeFromDate = (birthday) => {
  const birthYear = new Date(birthday).getFullYear();
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
};

const UserProfile = () => {
  const { user: currentUser, signOut } = useAuth();

  // const { data: friends } = useGetFriends(currentUser?.id);

  const { data: user, isLoading } = useQuery({
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

  const { data: friends } = useQuery({
    queryKey: ["friends", currentUser?.id],
    queryFn: async () => fetchFriendsList(currentUser?.id),
  });

  const handleUploadCoverImage = async () => {
    const res = await pickImage();
    console.log(res);
  };

  if (friends) {
    console.log({ friends });
  }

  const renderFriends = ({ item }: any) => (
    <TouchableOpacity
      style={{ alignItems: "center", gap: 5 }}
      onPress={() =>
        router.push({
          pathname: "/matchProfile",
          params: { matchProfile: JSON.stringify(item) },
        })
      }
    >
      <Avatar.Image
        title={item?.name}
        source={
          item?.profile_image ? { uri: item?.profile_image } : profileAvatar
        }
        size={40}
      />
      <Text variant="titleSmall" style={{ fontSize: 12 }}>
        {item?.name}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <FlashList
        estimatedItemSize={50}
        data={[]}
        renderItem={({ item }) => console.log(item)}
        ListHeaderComponent={() => (
          <View
            style={{
              flex: 1,
              gap: 24,
              marginBottom: 100,
            }}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <ImageBackground
              source={
                user?.profile_image
                  ? { uri: user?.profile_image }
                  : workoutLadies
              }
              style={{ width: "100%", height: 285 }}
            >
              <TouchableOpacity
                onPress={handleUploadCoverImage}
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "#E4E4E4",
                  borderRadius: 100,
                  position: "absolute",
                  alignItems: "center",
                  justifyContent: "center",
                  bottom: 20,
                  right: 20,
                }}
              >
                <Ionicons name="camera" size={26} />
              </TouchableOpacity>
            </ImageBackground>

            <View style={{ paddingHorizontal: 16, position: "relative" }}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  // backgroundColor: "green",
                  position: "absolute",
                  top: -75,
                  left: 16,
                  borderRadius: 360,
                  borderWidth: 3,
                  bottom: 0,
                  borderColor: Colors.mainBackground,
                }}
              >
                <Avatar.Image
                  source={
                    user?.profile_image
                      ? { uri: user?.profile_image }
                      : profileAvatar
                  }
                  // style={{ borderRadius: 100 }}
                  size={100}
                />

                <TouchableOpacity
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#E4E4E4",
                    borderRadius: 100,
                    position: "absolute",
                    alignItems: "center",
                    justifyContent: "center",
                    bottom: 0,
                    right: 0,
                  }}
                >
                  <Ionicons name="camera" size={26} />
                </TouchableOpacity>
              </View>
              <View style={{ position: "absolute", right: 10, top: 10 }}>
                <Button
                  mode="outlined"
                  iconPosition={"left"}
                  icon="pencil"
                  buttonStyle={{
                    // borderWidth: 2,
                    // borderRadius: 16,
                    backgroundColor: "black",
                    borderColor: "black",
                  }}
                  onPress={() => router.push("/profileUpdate")}
                >
                  Edit profile
                </Button>
              </View>
              {/*  MAIN CONTENT*/}
              <View style={{ marginTop: 40 }}>
                <Text variant="titleMedium">{user?.name}</Text>
                <View
                  style={{
                    marginTop: 6,
                    flexDirection: "row",
                    gap: 6,
                    alignItems: "center",
                    marginBottom: 28,
                  }}
                >
                  <Feather name="map-pin" size={20} />
                  <Text variant="bodyMedium">{user?.city}</Text>
                  <Feather name="x-circle" size={10} />
                  <Text variant="bodyMedium">
                    {calculateAgeFromDate(user?.birthday)} Years old
                  </Text>
                </View>

                {/*    BIO*/}
                {user?.bio && (
                  <View style={{ marginBottom: 28 }}>
                    <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                      Bio
                    </Text>
                    <Text variant="bodyMedium">{user?.bio}</Text>
                  </View>
                )}

                {/*FRIENDS*/}
                {friends && friends?.length > 0 && (
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                        Friends
                      </Text>
                      {/*<Link href="/profileUpdate">Show all</Link>*/}
                    </View>

                    <FlashList
                      data={friends}
                      renderItem={renderFriends}
                      estimatedItemSize={200}
                      horizontal
                    />
                  </View>
                )}

                {/*    GOALS BADGES*/}
                {user?.badges && (
                  <View style={{ marginBottom: 28 }}>
                    <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                      Goal Badges
                    </Text>
                    <Text variant="bodyMedium">
                      Fitness enthusiast on a journey to stay active, healthy,
                      and strong. Let's crush our goals together
                    </Text>
                  </View>
                )}
                {/*    Gender*/}
                {user?.gender && (
                  <View style={{ marginVertical: 28 }}>
                    <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                      Gender
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={{
                        backgroundColor: "#E4E4E4",
                        padding: 10,
                        alignSelf: "flex-start",
                        borderRadius: 8,
                      }}
                    >
                      {user?.gender}
                    </Text>
                  </View>
                )}

                {/*    FItness level*/}
                {user?.fitness_level && (
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
                      {user?.fitness_level}
                    </Text>
                  </View>
                )}
                {/*    Availability */}
                <View style={{ marginBottom: 28 }}>
                  {user?.availability && (
                    <>
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
                        {user?.availability?.map((availability: string) => (
                          <Text
                            variant="bodyMedium"
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
                    </>
                  )}
                  {/*    Workout type*/}
                  {user?.workout_type && (
                    <View style={{ marginBottom: 28, marginTop: 10 }}>
                      <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                        Workout Type
                      </Text>
                      <Text
                        variant="bodyMedium"
                        style={{
                          backgroundColor: "#E4E4E4",
                          padding: 10,
                          alignSelf: "flex-start",
                          borderRadius: 8,
                        }}
                      >
                        {user?.workout_type}
                      </Text>
                    </View>
                  )}
                  {/*    WORKOUT STYLE*/}
                  {user?.workout_style && (
                    <View style={{ marginBottom: 28, marginTop: 10 }}>
                      <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                        Workout Style
                      </Text>
                      <Text
                        variant="bodyMedium"
                        style={{
                          backgroundColor: "#E4E4E4",
                          padding: 10,
                          alignSelf: "flex-start",
                          borderRadius: 8,
                        }}
                      >
                        {user?.workout_style}
                      </Text>
                    </View>
                  )}
                  {/*    Fitness Goal*/}
                  {user?.fitness_goals && (
                    <>
                      <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                        Fitness Goals
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
                        {user?.fitness_goals?.map((goal: string) => (
                          <Text
                            variant="bodyMedium"
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
                    </>
                  )}

                  {/*    Prompt*/}
                  {user?.prompt && (
                    <View style={{ marginBottom: 28, marginTop: 10 }}>
                      <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                        Prompt
                      </Text>
                      {user?.prompt?.map((p: any, i: any) => (
                        <View key={i}>
                          <Text
                            variant="titleSmall"
                            size="xs"
                            style={{ marginBottom: 10, fontWeight: "900" }}
                          >
                            {p.q}
                          </Text>
                          <Text variant="bodyMedium">{p.a}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <Button
                    onPress={signOut}
                    mode="contained"
                    style={{
                      marginVertical: 20,
                    }}
                    buttonColor="#B52A18"
                  >
                    Logout
                  </Button>
                  <Button
                    onPress={() => console.log("Delete account")}
                    mode="outlined"
                    style={{
                      borderWidth: 2,
                      borderColor: "#B52A18",
                    }}
                    textColor="#B52A18"
                  >
                    Delete Account
                  </Button>
                </View>
              </View>
            </View>
          </View>
        )}
      />

      {/*<StatusBar style="light" hidden={true} />*/}
    </>
  );
};

export default UserProfile;
