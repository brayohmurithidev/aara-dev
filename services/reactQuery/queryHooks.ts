import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/initSupabase";

// get conversations
export const useGetConversations = (userId: string) => {
  return useQuery({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select(
          `
          *,
          user1:profiles!user1_id(id, name, profile_image),
          user2:profiles!user2_id(id, name, profile_image)
        `,
        )
        .or(`user1_id.eq.${userId}, user2_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Error getting conversations", error);
        throw error;
      }

      if (!conversations || conversations.length === 0) {
        return [];
      }

      return await Promise.all(
        conversations?.map(async (conversation: any) => {
          const otherUser =
            conversation.user1_id === userId
              ? conversation.user2
              : conversation.user1;

          let latestMessage;

          // Determine if the current user is the initiator
          const isInitiator = conversation.initiator_id === userId;

          if (conversation.match_status === "accepted") {
            const { data, error } = await supabase
              .from("messages")
              .select("*")
              .eq("conversation_id", conversation.id)
              .order("timestamp", { ascending: false })
              .limit(1);
            // .single();

            if (error) {
              console.log("error getting message", error);
              throw error;
            }

            latestMessage = data?.length
              ? {
                  message: data[0].message,
                  timestamp: data[0].timestamp,
                }
              : {
                  message:
                    "You are connected, you can start planning your workout!",
                  timestamp: conversation?.created_at,
                };
          } else {
            // Only show this message to the receiver (not the initiator)
            if (!isInitiator) {
              latestMessage = {
                message: `${otherUser?.name} wants to connect with you`,
                timestamp: conversation.created_at,
              };
            } else {
              // If the initiator, set the latestMessage to null or an empty string
              latestMessage = null;
            }
          }

          return {
            ...conversation,
            otherUser,
            latestMessage,
          };
        }) || [],
      );
    },
    enabled: !!userId,
  });
};

export const useWorkoutHistories = (limit) => {
  const queryClient = useQueryClient();

  // Fetch workout histories
  const {
    data: workoutHistories,
    isLoading: historiesFetching,
    error: historiesError,
  } = useQuery({
    queryKey: ["workoutHistories", limit], // Add limit to queryKey for cache management
    queryFn: async () => {
      let query = supabase
        .from("user_workouts")
        .select(
          `
          *,
          workout:workout_id (id, name, icon)
        `,
        )
        .order("updated_at", { ascending: false }); // Order by last updated date

      // Add limit if provided
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  // Set up real-time listener
  useEffect(() => {
    const channel = supabase
      .channel("user_workouts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_workouts" },
        () => {
          // Refetch workoutHistories on any change
          queryClient.invalidateQueries("workoutHistories");
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { workoutHistories, historiesFetching, historiesError };
};

export const useProgressHistory = () => {
  const {
    data: progressHistory,
    isLoading: loading,
    error: errorFetching,
  } = useQuery({
    queryKey: ["progress-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_workouts")
        .select(
          `
          *,
          workout:workout_id (id, name, icon)
        `,
        )
        // .eq("status", "on progress") // Filter where progress is "on progress"
        .order("updated_at", { ascending: false }) // Order by latest updated
        .limit(1); // Limit to 1 record

      if (error) throw error;
      return data;
    },
  });

  return { progressHistory, loading, errorFetching };
};

// SEND FRIEND REQUESTS

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      senderId,
      receiverId,
    }: {
      senderId: string;
      receiverId: string;
    }) => {
      const { data, error } = await supabase
        .from("friend_relationships")
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          status: "pending",
        });

      if (error) {
        // Handle duplicate friend request error
        if (error.code === "23505") {
          // Postgres unique constraint violation code
          throw new Error("Friend request already exists between these users.");
        }
        throw error;
      }
      console.log("....", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries("friendRequests");
    },
    onError: (error: any) => {
      console.error("Error sending friend request:", error);
    },
  });
};

// ACCEPT FRIEND REQUESTS
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId }: { requestId: any }) => {
      const { data, error } = await supabase
        .from("friend_relationships")
        .update({ status: "accepted" })
        .match({ id: requestId });

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["receivedRequests", "friends"],
      });
    },
    onError: (error) => {
      console.error("Error accepting friend request:", error);
    },
  });
};

// REJECT FRIEND REQUEST
export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId }: { requestId: any }) => {
      const { data, error } = await supabase
        .from("friend_relationships")
        .update({ status: "rejected" })
        .match({ id: requestId });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries("friendRequests");
    },
    onError: (error) => {
      console.error("Error rejecting friend request:", error);
    },
  });
};

// BLOCK USER
export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ senderId, receiverId }) => {
      const { data, error } = await supabase
        .from("friend_relationships")
        .update({ status: "blocked" })
        .match({ sender_id: senderId, receiver_id: receiverId });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries("friendRequests");
      queryClient.invalidateQueries("friends");
    },
    onError: (error) => {
      console.error("Error blocking user:", error);
    },
  });
};

// GET FRIENDS
export const useGetFriends = (userId) => {
  return useQuery({
    queryKey: ["friends", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friend_relationships")
        .select(
          `
          id,
          created_at,
          sender:profiles!sender_id(id, name, profile_image),
          receiver:profiles!receiver_id(id, name, profile_image)
        `,
        )
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq("status", "accepted");

      if (error) throw error;

      // Process the data to identify the friend and exclude the logged-in user
      return data.map((relationship) => {
        const friend =
          relationship.sender.id === userId
            ? relationship.receiver
            : relationship.sender;

        return {
          friendId: friend.id,
          name: friend.name,
          profile_image: friend.profile_image,
          relationshipId: relationship.id,
          connectedAt: relationship.created_at,
        };
      });
    },
  });
};

//GET FRIEND REQUESTS
export const useGetReceivedRequests = (userId) => {
  return useQuery({
    queryKey: ["receivedRequests", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friend_relationships")
        .select(
          `
          *,
          sender:profiles!sender_id(id, name, fitness_level, profile_image)
        `,
        )
        .eq("receiver_id", userId)
        .eq("status", "pending");
      if (error) {
        throw error;
      }

      return data;
    },
  });
};

// SEE MY REQUESTS
export const useGetSentRequests = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["myRequests", userId],
    queryFn: async () => {
      const { data: friends, error: friendsError } = await supabase
        .from("friend_relationships")
        .select(
          `
          *,
          receiver:profiles!receiver_id(id, name, fitness_level, profile_image)
        `,
        )
        .eq("sender_id", userId)
        .eq("status", "pending");

      if (friendsError) {
        throw new Error(
          friendsError.message || "Failed to fetch friend requests.",
        );
      }

      // Ensure a valid return value, return empty array if data is null or undefined
      return friends || [];
    },
    enabled: !!userId,
  });
};
