import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { StreamChat } from "stream-chat";
import { Chat, OverlayProvider, Streami18n } from "stream-chat-expo";
import { ImageBackground } from "expo-image";
import { splashImage } from "@/constants/images";
import { ActivityIndicator } from "react-native";
import * as Notifications from "expo-notifications";
import { tokenProvider } from "@/utils/tokenProvider";

const ChatProvider = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const clientRef = useRef<StreamChat | null>(null); // Keep a single instance of StreamChat.
  const i18nInstance = new Streami18n();

  useEffect(() => {
    if (!user) return;

    const connect = async () => {
      if (!clientRef.current) {
        // Initialize the client only once
        const client = StreamChat.getInstance(
          process.env.EXPO_PUBLIC_STREAM_API_KEY || "",
        );
        clientRef.current = client;
      }

      if (!clientRef.current.userID) {
        // Connect user only if not already connected
        await clientRef.current.connectUser(
          {
            id: user.id,
            name: user.name,
            image: user?.profile_image,
          },
          tokenProvider,
        );
      }

      setChatClient(clientRef.current);
    };

    connect();

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnectUser();
        clientRef.current = null;
      }
      setChatClient(null);
    };
  }, [user]);

  useEffect(() => {
    const handleNewMessage = async (event: any) => {
      if (event.message.user.id !== chatClient?.userID) {
        console.log("Received a message", event?.message);

        // Send push notification for the new message
        await Notifications.scheduleNotificationAsync({
          identifier: user?.token,
          content: {
            title: `New message from ${event.message.user.name}`,
            body: event.message.text,
            data: { message: event.message },
          },
          trigger: null,
        });
      }
    };

    if (chatClient) {
      chatClient.on("message.new", handleNewMessage);
    }

    return () => {
      if (chatClient) {
        chatClient.off("message.new", handleNewMessage);
      }
    };
  }, [chatClient]);

  if (!chatClient || !user) {
    return (
      <ImageBackground
        source={splashImage}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size="large" />
      </ImageBackground>
    );
  }

  return (
    <OverlayProvider>
      <Chat client={chatClient} i18nInstance={i18nInstance}>
        {children}
      </Chat>
    </OverlayProvider>
  );
};

export default ChatProvider;
