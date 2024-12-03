import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { Text } from "react-native-paper";

type ItemProps = {
  title: string;
  description: string;
  image: any;
  rating: string;
  distance: string;
};

const CardItem = ({ title, description, image, rating, distance, gymId }) => {
  console.log({ title, description, image, rating, distance, gymId });
  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: `/gymDetails`,
          params: { gymId: JSON.stringify(gymId) },
        })
      } // Pass gymId to fetch details
      style={styles.card}
    >
      <Image source={image} style={styles.image} contentFit="cover" />
      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text
            variant="titleMedium"
            style={{ color: Colors.baseWhite, weight: "700", fontSize: 16 }}
          >
            {title}
          </Text>
          <Text size="xs" style={{ color: Colors.baseWhite }}>
            {description}
          </Text>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <View
              style={{ flexDirection: "row", gap: 2, alignItems: "center" }}
            >
              <Text size="xs" style={{ color: Colors.baseWhite }}>
                {rating}
              </Text>
              <MaterialIcons name="star-rate" size={16} color="#FFD700" />
            </View>
            {/*<Text size="xs" style={{ color: Colors.baseWhite }}>*/}
            {/*  . {distance}*/}
            {/*</Text>*/}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FitnessSpots = ({ gyms }) => {
  return (
    <FlashList
      data={gyms}
      renderItem={({ item }) => (
        <CardItem
          title={item.name}
          description={item.address}
          image={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.image}&key=${process.env.EXPO_PUBLIC_GOOGLE_KEY}`}
          rating={item.rating ? item.rating.toString() : "N/A"}
          distance={"Approx 1 mile"} // Placeholder
          gymId={item.id}
        />
      )}
      estimatedItemSize={200}
      horizontal
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ width: 16 }}></View>}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    height: 190,
    width: 190,
    borderRadius: 8,
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent overlay
    borderRadius: 8,
  },
  content: {
    position: "absolute",
    bottom: 16,
    left: 16,
    gap: 5,
  },
});

export default FitnessSpots;
