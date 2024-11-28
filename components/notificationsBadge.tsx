import React from "react";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

const NotificationsBadge = () => {
  // const { client } = useChatContext();
  // const { user: currentUser } = useAuth();
  // const [unreadCount, setUnreadCount] = useState(0);
  //
  // // Function to fetch the latest unread count
  // const fetchUnreadMessage = async () => {
  //   try {
  //     const res = await client.getUnreadCount(currentUser?.id);
  //     // Only update if the count has changed
  //     const newUnreadCount = parseInt(res.total_unread_count, 10);
  //     if (newUnreadCount !== unreadCount) {
  //       setUnreadCount(newUnreadCount);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch unread messages:", error);
  //   }
  // };
  //
  // useEffect(() => {
  //   // Fetch unread messages initially
  //   if (client) {
  //     fetchUnreadMessage();
  //   }
  //
  //   // Define the event listener for new messages
  //   const handleNewMessage = (event) => {
  //     if (event.total_unread_count) {
  //       fetchUnreadMessage();
  //     }
  //   };
  //
  //   if (client && (currentUser || client.userID)) {
  //     client.on("notification.message_new", handleNewMessage);
  //   }
  //
  //   // Clean up event listener on component unmount
  //   return () => {
  //     if (client) {
  //       client.off("notification.message_new", handleNewMessage);
  //     }
  //   };
  // }, [client, currentUser]);

  return (
    <TouchableOpacity onPress={() => router.push("/(messages)")}>
      <Feather name="bell" size={21} />
      {/*{unreadCount > 0 && (*/}
      {/*    <Badge*/}
      {/*        value={unreadCount}*/}
      {/*        status="error"*/}
      {/*        containerStyle={{ position: "absolute", top: -12, left: 2 }}*/}
      {/*    />*/}
      {/*)}*/}
    </TouchableOpacity>
  );
};

export default NotificationsBadge;
