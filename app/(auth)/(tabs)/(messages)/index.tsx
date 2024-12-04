import React from "react";
import { useAuth } from "@/context/AuthProvider.tsx";
import { StyleSheet } from "react-native";
import { ChannelList } from "stream-chat-expo";
import { router } from "expo-router";

const Messages = () => {
  const { user } = useAuth();

  return (
    <ChannelList
      filters={{ members: { $in: [user?.id] } }}
      onSelect={(channel: any) => router.push(`/channel/${channel.cid}`)}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    // marginTop: 24,
  },
});

export default Messages;
