import React, { useEffect, useLayoutEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { router, useNavigation } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Colors } from "@/constants/Colors.ts";
// import { GridList, Spacings } from "react-native-ui-lib";
import * as Location from "expo-location";
import { Divider, Text } from "react-native-paper";

const getGymsNearby = async () => {
  // Fetch user's location and nearby gyms
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.log("Permission denied");
    return;
  }
  const location = await Location.getCurrentPositionAsync();
  const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_KEY;
  const { latitude, longitude } = location.coords;

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=gym&key=${googleApiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return data.results?.map((gym) => ({
      name: gym.name,
      address: gym.vicinity,
      rating: gym.rating,
      id: gym.place_id,
      image: gym.photos?.[0]?.photo_reference, // Optional image placeholder
    }));
  } catch (error) {
    console.error("Error fetching gyms:", error);
  }
};

const CardItem = ({ title, description, image, rating, distance, gymId }) => {
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
          <Text variant="bodyMedium" style={{ color: Colors.baseWhite }}>
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

const GymsNearMe = () => {
  const [gyms, setGyms] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchGyms = async () => {
      const gymsData = await getGymsNearby();

      setGyms(gymsData);
    };
    fetchGyms();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, []);

  return (
    <SafeAreaView edges={[]} style={styles.container}>
      <GridList
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={{ marginBottom: 16 }}>
            <Text>Perfect Gyms for You</Text>
            <Text>Based on your preferences, here are nearby gyms</Text>
            <Divider style={{ marginVertical: 16 }} />
            <Text size="xs">Results ({gyms.length})</Text>
          </View>
        )}
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
        maxItemWidth={200}
        numColumns={2}
        itemSpacing={Spacings.s3}
        listPadding={Spacings.s5}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
  },
  card: {
    height: 190,
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

export default GymsNearMe;
