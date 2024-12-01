import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Channel as ChannelType } from "stream-chat";
import {
  Channel,
  MessageInput,
  MessageList,
  useChatContext,
} from "stream-chat-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthProvider.tsx";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/initSupabase.ts";
import { Colors } from "@/constants/Colors.ts";
import { Avatar, Button, Text } from "react-native-paper";
import LoadingSpinner from "@/components/loadingSpinner.tsx";
import { profileAvatar } from "@/constants/images.ts";

const ChannelScreen = () => {
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const { user2_id } = useLocalSearchParams();
  const { user } = useAuth();
  const { cid } = useLocalSearchParams<{ cid: string }>();
  const queryClient = useQueryClient();
  const { client } = useChatContext();
  const navigation = useNavigation();

  useEffect(() => {
    const conversationChannel = supabase
      .channel("conversation_updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conversations" },
        async (payload) => {
          if (payload.new?.id === conversationStatus?.id) {
            await refetch();
          }
        },
      )
      .subscribe();

    return () => conversationChannel.unsubscribe();
  }, [conversationStatus?.id]);

  // Fetch channel and setup real-time listener on mount
  useEffect(() => {
    const fetchChannel = async () => {
      const res = await client.queryChannels({ cid });
      setChannel(res[0]);
    };

    fetchChannel().catch((error) =>
      console.log("Error fetching channel:", error),
    );
  }, [cid, client]);

  // Memoize the other member's data for smoother renders
  const otherMember = useMemo(() => {
    if (!channel) return null;
    const members = Object.values(channel?.state.members || {});
    console.log({ members });
    return members.find((member) => member?.user_id !== user?.id)?.user || null;
  }, [channel, user?.id]);

  console.log({ otherMember });

  // Set up header with a placeholder if `otherMember` is not yet loaded
  useEffect(() => {
    if (!otherMember) {
      // Show a placeholder header until `otherMember` data is available
      navigation.setOptions({
        headerShown: true,
        headerLeft: () => (
          <Pressable onPress={() => router.navigate("/(messages)")}>
            <Feather name="chevron-left" size={24} color="gray" />
          </Pressable>
        ),
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <ActivityIndicator size="small" color="gray" />
            <Text>Loading...</Text>
          </View>
        ),
      });
    } else {
      // Update the header with actual member information once loaded
      navigation.setOptions({
        headerShown: true,
        headerLeft: () => (
          <Pressable onPress={() => router.navigate("/(messages)")}>
            <Feather name="chevron-left" size={24} color="gray" />
          </Pressable>
        ),
        headerTitle: () =>
          otherMember ? (
            <View style={styles.headerContainer}>
              <Avatar.Image
                source={
                  otherMember?.image
                    ? { uri: otherMember?.image }
                    : profileAvatar
                }
                size={28}
                // rounded
              />
              <Text variant="titleMedium">{otherMember?.name}</Text>
            </View>
          ) : (
            <LoadingSpinner />
          ),
        // headerTitleAlign: "left",
      });
    }
  }, [otherMember, navigation]);

  // Fetch conversation status with query
  const {
    data: conversationStatus,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["conversationStatus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, match_status, initiator_id")
        .or(
          `and(user1_id.eq.${user?.id}, user2_id.eq.${otherMember?.id}),and(user1_id.eq.${otherMember?.id}, user2_id.eq.${user?.id})`,
        )
        .single();
      if (error) {
        console.log("Error checking match status:", error);
        throw error;
      }
      return data;
    },
    enabled: !!otherMember,
  });

  // Mutation for responding to requests
  const respondToRequest = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from("conversations")
        .update({ match_status: status })
        .eq("id", conversationStatus?.id);
      if (error) {
        console.error("Update convo:", error);
        throw error;
      }
    },
    onSuccess: async () => {
      await refetch();
      queryClient.invalidateQueries(["conversationStatus"]);
    },
  });

  // Smooth transition to conversation views based on match status
  if (isLoading || !conversationStatus) return <LoadingSpinner />;

  if (
    otherMember &&
    !isLoading &&
    conversationStatus.match_status === "pending" &&
    conversationStatus.initiator_id === otherMember?.id
  ) {
    return (
      <ConnectionRequest
        otherMember={otherMember}
        onAccept={() => respondToRequest.mutate("accepted")}
        onReject={() => respondToRequest.mutate("rejected")}
        loading={respondToRequest.isLoading}
      />
    );
  }

  if (
    otherMember &&
    !isLoading &&
    conversationStatus.match_status === "pending" &&
    conversationStatus.initiator_id !== otherMember?.id
  ) {
    return (
      <SafeAreaView style={styles.waitingContainer}>
        <Text>{`Waiting for ${otherMember?.name} to accept your invite before you can chat.`}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={[]} style={styles.container}>
      {channel ? (
        <Channel channel={channel}>
          <MessageList />
          <SafeAreaView edges={["bottom"]}>
            <MessageInput />
          </SafeAreaView>
        </Channel>
      ) : (
        <LoadingSpinner title="Fetching messages ..." />
      )}
    </SafeAreaView>
  );
};

// Separate ConnectionRequest component for cleaner conditional renders
const ConnectionRequest = ({ otherMember, onAccept, onReject, loading }) => (
  <SafeAreaView style={styles.connectionRequestContainer}>
    <Text
      style={styles.textCenter}
    >{`Hello! ${otherMember?.name} wants to connect.`}</Text>
    <Text style={styles.textSmall}>
      By connecting, you will be able to message them and plan your workout
      schedule.
    </Text>
    <View style={styles.buttonContainer}>
      <Button
        buttonStyle={styles.transparentButton}
        onPress={onAccept}
        loading={loading}
      >
        Accept
      </Button>
      <Button buttonStyle={{ backgroundColor: Colors.red }} onPress={onReject}>
        Reject
      </Button>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginHorizontal: 16,
  },
  waitingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  connectionRequestContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 24,
    paddingHorizontal: 16,
    width: "80%",
    marginHorizontal: "auto",
  },
  textCenter: { textAlign: "center" },
  textSmall: { textAlign: "center", fontSize: 12 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 24,
  },
  transparentButton: {
    // backgroundColor: "transparent",
  },
});

export default ChannelScreen;
