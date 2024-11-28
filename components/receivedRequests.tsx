import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/context/AuthProvider";
import { FlashList } from "@shopify/flash-list";

import { router } from "expo-router";
import { Colors } from "@/constants/Colors";

import LoadingSpinner from "@/components/loadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { profileAvatar } from "@/constants/images";
import { supabase } from "@/config/initSupabase";
import { Avatar, Button, Text } from "react-native-paper";

const ReceivedRequest = ({ searchTerm }: { searchTerm: string }) => {
  const {
    user: { id: userId },
  } = useAuth();

  useEffect(() => {
    refetch();
  }, []);

  const {
    data: requests,
    isLoading: fetchingRequests,
    refetch,
  } = useQuery({
    queryKey: ["pendingRequests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
    *,
    user1:profiles!user1_id(*), 
    user2:profiles!user2_id(*)
  `,
        )
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .neq("initiator_id", userId)
        .eq("match_status", "pending");

      if (error) {
        console.error("Error fetching conversations:", error);
        throw error;
      }
      return data.map((conversation) => {
        // Determine the "other" user based on the current user's ID
        const otherUser =
          conversation.user1_id === userId
            ? conversation.user2
            : conversation.user1;

        return {
          ...conversation,
          otherUser, // This will contain the data of the non-current user
        };
      });
    },
  });

  // ACCEPT REQUEST

  const renderItem = ({ item }: { item: any }) => {
    const { otherUser: sender, match_status, id: conversationId } = item;
    console.log("ReceivedRequest", item);

    if (!sender?.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null;
    }

    // console.log("searchTerm", searchTerm)
    return (
      <View style={styles.container}>
        <Avatar
          title={sender?.name[0]} // First letter of name as the avatar title
          // containerStyle={styles.avatar}
          source={
            sender?.profile_image
              ? { uri: sender?.profile_image }
              : profileAvatar
          }
          size={30}
        />
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/matchProfile",
              params: { matchProfile: JSON.stringify(sender) },
            })
          }
          style={{
            flex: 1,
            marginHorizontal: 10,
          }}
        >
          {/* Handle long names with ellipsis */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "#333",
              marginBottom: 2,
              overflow: "hidden",
            }}
            numberOfLines={1}
          >
            {sender.name}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#777",
            }}
          >
            Level: {sender.fitness_level}
          </Text>
        </TouchableOpacity>
        <Button
          onPress={() =>
            router.push({
              pathname: "/conversationId",
              params: {
                conversationId,
                match_status,
                otherUser: JSON.stringify(sender),
              },
            })
          }
          buttonStyle={{ backgroundColor: Colors.mainButtonBackground }}
          containerStyle={{
            borderRadius: 8,
          }}
        >
          Accept
        </Button>
      </View>
    );
  };

  if (fetchingRequests) return <LoadingSpinner title="Fetching requests ..." />;

  return (
    <View style={{}}>
      <FlashList
        data={requests && requests?.length > 0 ? requests : []}
        renderItem={renderItem}
        estimatedItemSize={200}
        ListEmptyComponent={() => (
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text size="xs">You have no pending friend requests</Text>
          </View>
        )}
      />
    </View>
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
});

export default ReceivedRequest;
