import { supabase } from "@/config/initSupabase";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";

export const getUsersMatch = async (currentUser: any) => {
  // Fetch friend relationships and requests
  const { data: relationships, error: relationshipError } = await supabase
    .from("friend_relationships")
    .select("sender_id, receiver_id, status")
    .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`);

  if (relationshipError) throw relationshipError;

  // Extract user IDs to exclude
  const excludedUserIds =
    relationships?.flatMap((rel) => {
      if (rel.status === "accepted") {
        // Already friends
        return [rel.sender_id, rel.receiver_id];
      } else if (rel.sender_id === currentUser.id) {
        // Requests sent
        return [rel.receiver_id];
      } else {
        // Requests received
        return [rel.sender_id];
      }
    }) || [];

  // Fetch users matching fitness level
  const { data: matches, error: matchError } = await supabase
    .from("profiles")
    .select("*")
    .or(`fitness_level.eq.${currentUser?.fitness_level}`);

  if (matchError) throw matchError;

  // Filter out excluded users and current user
  return matches?.filter(
    (res) => res.id !== currentUser?.id && !excludedUserIds.includes(res.id),
  );
};

export const uploadImageAndStoreURL = async (
  fileUri: string,
  fileName: string,
) => {
  try {
    // Read file as base64
    const base64FileData = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Decode base64 to ArrayBuffer
    const fileArrayBuffer = decode(base64FileData);

    // Upload the file
    const { data, error } = await supabase.storage
      .from("avatars") // Replace 'avatars' with your bucket name
      .upload(fileName, fileArrayBuffer, {
        contentType: "image/*", // Adjust the content type based on your file extension
        upsert: false, // Set this to true if you want to overwrite existing files
      });

    if (error) {
      console.error("Error uploading image", error);
      throw error;
    }

    // console.log("Uploaded file:", data);

    console.log(`${fileName}`);

    // Get the public URL of the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName); // Fetch the public URL using the file name

    return publicUrl;
  } catch (error) {
    console.error("Error during upload and update", error);
    return null;
  }
};
