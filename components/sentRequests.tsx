import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/context/AuthProvider";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { FlashList } from "@shopify/flash-list";
import LoadingSpinner from "@/components/loadingSpinner";
import { profileAvatar } from "@/constants/images";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/initSupabase";
import Toast from "react-native-root-toast";
import { Avatar, Button, Text } from "react-native-paper";

const SentRequest = ({ searchTerm }: { searchTerm: string }) => {
  const {
    user: { id: userId },
  } = useAuth();
  const queryClient = useQueryClient();

  // FETCH REQUESTS THAT ARE PENDING AND AM INITIATOR
  const {
    data: pendings,
    isLoading: fetchingPendings,
    refetch,
  } = useQuery({
    queryKey: ["requests"],
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
        // .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq("initiator_id", userId)
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

  useEffect(() => {
    refetch();
  }, []);

  // HANDLE CANCEL REQUEST

  const {
    mutate: handleCancelRequest,
    isPending: deletingConversation,
    error,
  } = useMutation({
    mutationFn: async (conversationId: string) => {
      try {
        const { data, error } = await supabase
          .from("conversations")
          .delete()
          .eq("id", conversationId);
        if (error) throw error;
        return data;
      } catch (error) {
        console.error(error);
      } finally {
      }
    },
    onSuccess: async () =>
      await queryClient.invalidateQueries({ queryKey: ["requests"] }),
    onError: (error) => {
      Toast.show(error?.message || "Couldn't cancel your request", {
        duration: Toast.durations.LONG,
        position: Toast.positions.TOP,
        backgroundColor: Colors.red,
      });
    },
  });

  const renderItem = ({ item }: { item: any }) => {
    const { otherUser: receiver, id: conversationId } = item;
    console.log("ReceivedRequest", { item });
    if (!receiver?.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null;
    }

    // console.log("searchTerm", searchTerm)
    return (
      <View style={styles.container}>
        <Avatar
          title={receiver?.name[0]} // First letter of name as the avatar title
          // containerStyle={styles.avatar}
          source={
            receiver?.profile_image
              ? { uri: receiver?.profile_image }
              : profileAvatar
          }
          size={30}
        />
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/matchProfile",
              params: { matchProfile: JSON.stringify(receiver) },
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
            {receiver.name}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#777",
            }}
          >
            Level: {receiver.fitness_level}
          </Text>
        </TouchableOpacity>
        <Button
          onPress={() => handleCancelRequest(conversationId)}
          title={"Cancel"}
          buttonStyle={{ backgroundColor: Colors.mainButtonBackground }}
          containerStyle={{
            borderRadius: 8,
          }}
          loading={deletingConversation}
          disabled={deletingConversation}
        />
      </View>
    );
  };

  if (fetchingPendings)
    return <LoadingSpinner title="Fetching pending requests ..." />;
  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={pendings && pendings.length > 0 ? pendings : []}
        renderItem={renderItem}
        estimatedItemSize={100}
        ListEmptyComponent={() => (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text variant="bodyMedium">No Pending sent requests</Text>
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

export default SentRequest;
