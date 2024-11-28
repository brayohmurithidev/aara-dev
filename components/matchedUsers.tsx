import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { FlashList } from "@shopify/flash-list";

import { Colors } from "@/constants/Colors";
import { router } from "expo-router";

import { useAuth } from "@/context/AuthProvider";
import LoadingSpinner from "@/components/loadingSpinner";
import { profileAvatar } from "@/constants/images";

import { supabase } from "@/config/initSupabase";
import { calculateDistanceScore } from "@/services/reactQuery/matchingAlg";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChatContext } from "stream-chat-expo";
import { Avatar, Button, Text } from "react-native-paper";

const transformedData = (originalData: any) => {
  return originalData.map((item: any) => ({
    requestId: item.id,
    sender_id: item.sender.id,
    name: item.sender.name,
    fitness_level: item.sender.fitness_level,
    profile_image: item.sender.profile_image,
  }));
};

const getRankedMatches = async (currentUser: any) => {
  // Step 1: Filter out users with existing conversations
  const { data: convos, error: convosError } = await supabase
    .from("conversations")
    .select("user1_id, user2_id")
    .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`);

  if (convosError) {
    // console.error(convosError);
    throw convosError;
  }
  // console.log("Convos", convos);
  const excludedUserIds = new Set();
  convos?.forEach((conv) => {
    if (conv?.user1_id !== currentUser.id) {
      excludedUserIds.add(conv.user1_id);
    }
    if (conv.user2_id !== currentUser.id) {
      excludedUserIds.add(conv.user2_id);
    }
  });

  // console.log("Id's to exclude: ", excludedUserIds);

  // fetchs users that are not in exclude, or current user
  const { data: potentialMatches, error: potentialMatchesError } =
    await supabase
      .from("profiles")
      .select("*")
      .neq("id", currentUser?.id)
      .not("id", "in", `(${Array.from(excludedUserIds).join(",")})`);

  if (potentialMatchesError) {
    // console.error("Error fetching potentialMatches", potentialMatchesError);
    throw potentialMatchesError;
  }

  // console.log("potentialMatches", potentialMatches);

  const calculateFitnessLevelScore = (user) => {
    return user?.fitness_level === currentUser?.fitness_level ? 1 : 0;
  };

  const calculateWorkoutPreferencesScore = (user) => {
    const sharedPreferences = user?.preferences
      ? user?.preferences?.filter((preference: string) =>
          currentUser?.preferences?.includes(preference),
        )
      : null;
    return sharedPreferences
      ? sharedPreferences?.length / currentUser?.preferences?.length
      : 0; // Score between 0 and 1
  };

  const calculateAvailabilityScore = (user) => {
    const sharedAvailability = user?.availability?.filter((slot) =>
      currentUser?.availability?.includes(slot),
    );
    return sharedAvailability?.length / currentUser?.availability?.length; // Score between 0 and 1
  };

  const calculateWorkoutStyleScore = (user) => {
    return user?.workout_style === currentUser?.workout_style ? 1 : 0;
  };

  const calculateFitnessGoalScore = (user) => {
    const sharedGoals = user?.fitness_goals?.filter((slot) =>
      currentUser?.fitness_goals?.includes(slot),
    );
    return sharedGoals?.length / currentUser?.fitness_goals?.length; // Score between 0 and 1
    // return user.fitness_goal === currentUser.fitness_goal ? 1 : 0;
  };

  // Calculate each user weight score

  return potentialMatches
    ?.map((user) => {
      console.log("Locations", user, currentUser?.location);
      const distanceScore = calculateDistanceScore(
        user?.location,
        currentUser?.location,
      );
      const fitnessLevelScore = calculateFitnessLevelScore(user) * 0.1;
      const workoutPreferencesScore =
        calculateWorkoutPreferencesScore(user) * 0.1;
      const availabilityScore = calculateAvailabilityScore(user) * 0.1;
      const fitnessGoalScore = calculateFitnessGoalScore(user) * 0.1;
      const workoutStyleScore = calculateWorkoutStyleScore(user) * 0.1;

      const totalScore =
        distanceScore +
        fitnessLevelScore +
        workoutPreferencesScore +
        availabilityScore +
        workoutStyleScore +
        fitnessGoalScore;

      return { user, score: totalScore };
    })
    .sort((a, b) => b.score - a.score);
};

const MatchedUsers = ({
  searchTerm,

  selectedIndex,
}: {
  searchTerm: string;
  selectedIndex: any;
}) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { client } = useChatContext();

  const { data: suggestions, isLoading: fetchingSuggestions } = useQuery({
    queryKey: ["matchedUsers", user],
    queryFn: async () => await getRankedMatches(user),
  });

  // handle matching
  const handleMatching = async (currentUserId: string, otherUserId: string) => {
    // try {
    //   const channel = client.channel("messaging", {
    //     members: [currentUserId, otherUserId],
    //   });
    //   await channel.watch();
    //   router.replace(`/channel/${channel?.cid}`);
    // } catch (error) {
    //   console.log(error);
    // }

    // user1_id, user2_id, initiator_id, match_status;
    try {
      setIsLoading(true);
      const channel = client.channel("messaging", {
        members: [currentUserId, otherUserId],
      });
      const res = await channel.watch();
      console.log({ channel: res });
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
      await queryClient.invalidateQueries({
        queryKey: ["matchedUsers", user],
      });

      router.push({
        pathname: `/channel/${channel?.cid}`,
        params: { user2_id: otherUserId },
      });
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

  const renderItem = ({ item }: { item: any }) => {
    const { score, user: matchedUser } = item;
    if (!matchedUser.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null;
    }

    // console.log("searchTerm", searchTerm)
    return (
      <View style={styles.container}>
        <Avatar
          title={matchedUser.name[0]} // First letter of name as the avatar title
          containerStyle={styles.avatar}
          source={
            matchedUser?.profile_image
              ? { uri: matchedUser?.profile_image }
              : profileAvatar
          }
          rounded
          size={40}
        />
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/matchProfile",
              params: { matchProfile: JSON.stringify(matchedUser) },
            })
          }
          style={styles.infoContainer}
        >
          {/* Handle long names with ellipsis */}
          <Text style={styles.name} numberOfLines={1}>
            {matchedUser.name}
          </Text>
          <Text style={styles.level}>Level: {matchedUser.fitness_level}</Text>
        </TouchableOpacity>
        <Button
          onPress={() => userId && handleMatching(userId, matchedUser?.id)}
          buttonStyle={{ backgroundColor: Colors.mainButtonBackground }}
          containerStyle={{
            borderRadius: 8,
          }}
          loading={isLoading}
          disabled={isLoading}
        >
          Match Now
        </Button>
      </View>
    );
  };

  if (fetchingSuggestions)
    return <LoadingSpinner title="Fetching your matches ..." />;

  return (
    <>
      <FlashList
        renderItem={renderItem}
        extraData={searchTerm}
        data={suggestions && suggestions?.length > 0 ? suggestions : []}
        ListEmptyComponent={() => (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text variant="titleSmall">No matches available</Text>
          </View>
        )}
        estimatedItemSize={50}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff", // Change as needed
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    marginVertical: 8,
  },
  avatar: {
    backgroundColor: Colors.ecru800,
  },
  infoContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
    overflow: "hidden",
  },
  level: {
    fontSize: 14,
    color: "#777",
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    // backgroundColor: Colors.primary, // Adjust primary color
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default MatchedUsers;
