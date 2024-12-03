import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Image, ImageBackground } from "expo-image";

import { workoutLadies } from "@/constants/images.ts";
import BackButton from "@/components/backButton.tsx";
import { Text } from "react-native-paper";

const GymDetails = () => {
  const [details, setDetails] = useState(null);
  const { gymId } = useLocalSearchParams();
  const id = JSON.parse(gymId);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchGymDetails = async () => {
      const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_KEY;
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&key=${googleApiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        setDetails(data.result);
      } catch (error) {
        console.error("Error fetching gym details:", error);
      }
    };

    fetchGymDetails();
  }, [id]);

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <ImageBackground
          source={{
            uri: details?.photos?.[0]?.photo_reference
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${details.photos[0].photo_reference}&key=${process.env.EXPO_PUBLIC_GOOGLE_KEY}`
              : workoutLadies,
          }}
          style={{
            height: 200,
            // backgroundColor: "red",
            paddingVertical: 16,
            width: "100%",
            paddingHorizontal: 16,
          }}
        >
          <BackButton
            buttonStyles={{
              backgroundColor: "#fff",
              borderRadius: 360,
            }}
          />
        </ImageBackground>
      ),
    });
  }, [details]);

  if (!details) return <Text>Loading...</Text>;

  const renderPhoto = ({ item }) => (
    <Image
      source={{
        uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photo_reference}&key=${process.env.EXPO_PUBLIC_GOOGLE_KEY}`,
      }}
      style={styles.galleryImage}
    />
  );

  return (
    <SafeAreaView edges={[]} style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text variant="titleMedium" style={{ marginBottom: 20 }}>
            {details.name}
          </Text>
          <View style={styles.contactInfo}>
            <Feather name="map-pin" size={16} />
            <Text size="sm">{details.vicinity}</Text>
          </View>
          {details.current_opening_hours && (
            <View style={styles.contactInfo}>
              <Feather name="clock" size={16} />
              <Text size="sm" style={styles.openingHoursText}>
                {details.current_opening_hours.weekday_text[0].split(": ")[1]}
              </Text>
            </View>
          )}
          {details.formatted_phone_number && (
            <View style={styles.contactInfo}>
              <Feather name="phone" size={16} />
              <Text size="sm">{details.formatted_phone_number}</Text>
            </View>
          )}
          {/*<Heading style={styles.aboutHeading} size="sm">*/}
          {/*  About*/}
          {/*</Heading>*/}
          {/*<Text style={styles.descriptionText}>*/}
          {/*  ABC Yoga House is a peaceful space dedicated to enhancing well-being*/}
          {/*  through yoga. It offers classes for all levels, promoting*/}
          {/*  flexibility, strength, and mindfulness under the guidance of*/}
          {/*  experienced instructors, making it a sanctuary for personal growth*/}
          {/*  and wellness.*/}
          {/*</Text>*/}
          {/*<Button title="Continue" containerStyle={styles.continueButton} />*/}
        </View>

        {/* Gallery Section */}
        {details.photos && (
          <View style={styles.galleryContainer}>
            <Text variant="titleMedium" style={styles.galleryHeading}>
              Gallery
            </Text>
            <FlatList
              data={details.photos}
              renderItem={renderPhoto}
              keyExtractor={(item) => item.photo_reference}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.galleryList}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerImage: {
    height: 200,
    width: "100%",
    paddingVertical: 16,
  },
  headerOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 24,
  },
  content: {
    padding: 16,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  aboutHeading: {
    marginVertical: 12,
  },
  descriptionText: {
    lineHeight: 22,
  },
  continueButton: {
    marginTop: 24,
  },
  galleryContainer: {
    marginTop: 24,
  },
  galleryHeading: {
    marginBottom: 8,
  },
  galleryList: {
    paddingVertical: 8,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
});

export default GymDetails;
