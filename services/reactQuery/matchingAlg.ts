import { supabase } from "@/config/initSupabase"; // Assuming haversine-distance library is used for geolocation
import haversine from "haversine-distance";

export const calculateDistanceScore = (
  userLocation: any,
  currentUserLocation: any,
) => {
  const { lat: user1Lat, lon: user2Lon } = userLocation;
  const { lat, lon } = currentUserLocation;
  const distance = haversine(
    { latitude: user1Lat, longitude: user2Lon },
    { lat, lon },
  ); // distance in mitres
  const maxDistance = 50000; // 50km
  return Math.max(0, (maxDistance - distance) / maxDistance); // Score between 0 and 1
};

export const getRankedMatches = async (currentUser: any) => {
  // Step 1: Filter out users with existing conversations
  const { data: conversations } = await supabase
    .from("conversations")
    .select("user1_id, user2_id")
    .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`);

  // const excludedUserIds = new Set();
  // conversations?.forEach((conv) => {
  //   if (conv.user1_id !== currentUser.id) {
  //     excludedUserIds.add(conv.user1_id);
  //   }
  //   if (conv.user2_id !== currentUser.id) {
  //     excludedUserIds.add(conv.user2_id);
  //   }
  // });
  //
  // // Step 2: Fetch all users matching the criteria
  // const { data: potentialMatches } = await supabase
  //   .from("profiles")
  //   .select("*")
  //   .neq("id", currentUser.id) // Exclude current user
  //   .not("id", "in", `(${Array.from(excludedUserIds).join(",")})`);
  //
  // // Step 3: Define scoring functions for each criterion
  //
  // const calculateDistanceScore = (user) => {
  //   const userLocation = { lat: user.latitude, lon: user.longitude };
  //   const currentUserLocation = {
  //     lat: currentUser.latitude,
  //     lon: currentUser.longitude,
  //   };
  //   const distance = haversine(currentUserLocation, userLocation);
  //
  //   const maxDistance = 50000; // Define a max distance (e.g., 50km)
  //   return Math.max(0, (maxDistance - distance) / maxDistance); // Score between 0 and 1
  // };
  //
  // const calculateFitnessLevelScore = (user) => {
  //   return user.fitness_level === currentUser.fitness_level ? 1 : 0;
  // };
  //
  // const calculateWorkoutPreferencesScore = (user) => {
  //   const sharedPreferences = user.workout_preferences.filter((preference) =>
  //     currentUser.workout_preferences.includes(preference),
  //   );
  //   return sharedPreferences.length / currentUser.workout_preferences.length; // Score between 0 and 1
  // };
  //
  // const calculateAvailabilityScore = (user) => {
  //   const sharedAvailability = user.availability.filter((slot) =>
  //     currentUser.availability.includes(slot),
  //   );
  //   return sharedAvailability.length / currentUser.availability.length; // Score between 0 and 1
  // };
  //
  // const calculateWorkoutStyleScore = (user) => {
  //   return user.workout_style === currentUser.workout_style ? 1 : 0;
  // };
  //
  // const calculateFitnessGoalScore = (user) => {
  //   return user.fitness_goal === currentUser.fitness_goal ? 1 : 0;
  // };
  //
  // // Step 4: Calculate the weighted score for each user
  // const rankedMatches = potentialMatches
  //   .map((user) => {
  //     const distanceScore = calculateDistanceScore(user) * 0.5;
  //     const fitnessLevelScore = calculateFitnessLevelScore(user) * 0.1;
  //     const workoutPreferencesScore =
  //       calculateWorkoutPreferencesScore(user) * 0.1;
  //     const availabilityScore = calculateAvailabilityScore(user) * 0.1;
  //     const workoutStyleScore = calculateWorkoutStyleScore(user) * 0.1;
  //     const fitnessGoalScore = calculateFitnessGoalScore(user) * 0.1;
  //
  //     const totalScore =
  //       distanceScore +
  //       fitnessLevelScore +
  //       workoutPreferencesScore +
  //       availabilityScore +
  //       workoutStyleScore +
  //       fitnessGoalScore;
  //
  //     return { user, score: totalScore };
  //   })
  //   .sort((a, b) => b.score - a.score); // Sort in descending order by score
  //
  // // Step 5: Return ranked matches
  // return rankedMatches;
};
