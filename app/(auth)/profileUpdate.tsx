import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { chevronLeft } from "@/constants/images.ts";
import { router } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import TextArea from "@/components/textArea.tsx";
import Input from "@/components/input.tsx";
import Select from "@/components/select.tsx";
import { Formik } from "formik";
import MultiSelect from "@/components/multiSelect.tsx";
import PromptModal from "@/components/promptModal.tsx";
import Modal from "@/components/modal.tsx";
import useLocation from "@/hooks/useLocation.tsx";
import Toast from "react-native-root-toast";
import { useAuth } from "@/context/AuthProvider.tsx";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/initSupabase.ts";
import { pickImage } from "@/utils/imagePicker.ts";
import { uploadImageAndStoreURL } from "@/config/supabase_service.ts";
import { Button, Text } from "react-native-paper";

const ProfileUpdate = () => {
  const { top, bottom } = useSafeAreaInsets();

  const { user: currentUser } = useAuth();
  const [visibility, setVisibility] = useState(false);
  const [profileURL, setProfileURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    profile_image: null,
    name: "",
    bio: "",
    city: "",
    workout_style: "",
    preferences: [],
    availability: [],
    prompt: [],
  });
  const { location, errorMsg, currentCity } = useLocation();

  // IMAGE UPLOAD
  const handleImageUpload = async (setFieldValue) => {
    try {
      setIsUploading(true);
      const image = await pickImage();
      if (image) {
        setFieldValue("profile_image", image?.assets[0].uri);
        const initialFilename = image?.assets[0]?.uri?.split("/").pop();
        const fileName = `profile-${initialFilename}`;

        const imageUrl: string | null = await uploadImageAndStoreURL(
          image?.assets[0].uri,
          fileName,
        );
        if (imageUrl) {
          setFieldValue("profile_image", imageUrl);
          setProfileURL(imageUrl);
        }
      } else {
        console.log("No image");
      }
    } catch (error) {
      console.error("Upload error", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (userData: any) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ ...userData, profile_image: profileURL })
        .eq("id", user?.id);
      if (error) {
        console.error("Error saving user data: ", error);
      } else {
        Toast.show("Data updated successfully", {
          duration: Toast.durations.LONG,
          position: Toast.positions.TOP,
          backgroundColor: "green",
          containerStyle: {
            marginTop: 24,
          },
        });
        setInitialValues(initialValues);
        // setTimeout(() => {
        //   router.push("/home");
        // }, 5000);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentCity) {
      setInitialValues({ ...initialValues, city: currentCity[0]?.city });
    }
  }, [currentCity]);

  const { data: user, isLoading: userFetching } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser?.id,
  });

  if (userFetching) {
    return (
      <View>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Use useEffect to set initial values
  useEffect(() => {
    if (user) {
      setInitialValues({
        ...initialValues,
        profile_image: user.profile_image || null,
        availability: user.availability || [],
        city: user.city || "",
        workout_style: user.workoutStyle || "",
        preferences: user.preferences || [],
        prompt: user.prompt || [],
        bio: user.bio || "",
        name: user.name || "",
      });
    }
  }, [user]); // This effect will run whenever 'user' changes
  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: top, marginBottom: bottom }]}
      behavior={"padding"}
      keyboardVerticalOffset={top}
    >
      <ScrollView
        contentContainerStyle={styles.onboardWrapper}
        showsVerticalScrollIndicator={false}
      >
        <Formik
          initialValues={initialValues}
          onSubmit={async (values) => await handleSubmit(values)}
          enableReinitialize={true}
        >
          {({
            handleChange,
            handleSubmit,
            values: {
              profile_image,
              bio,
              city,
              workout_style,
              preferences,
              availability,
              prompt,
              name,
            },
            setFieldValue,
          }) => (
            <>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  marginVertical: 30,
                  // marginBottom: 46,
                }}
              >
                <TouchableOpacity
                  // style={styles.backButton}
                  style={{
                    alignSelf: "flex-start",
                  }}
                  onPress={() => router.back()}
                >
                  <Image
                    source={chevronLeft}
                    style={{ width: 32, height: 32 }}
                  />
                </TouchableOpacity>
                <Text
                  variant={"titleLarge"}
                  style={{ marginHorizontal: "auto" }}
                >
                  Edit Profile
                </Text>
              </View>
              <Text variant="titleSmall" style={{ marginBottom: 8 }}>
                Profile Photos
              </Text>
              <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
                Use your most recent photos
              </Text>
              <View style={{ flexDirection: "row", gap: 24, marginBottom: 28 }}>
                {profile_image && (
                  <View style={styles.addProfileCard}>
                    <Image
                      source={{ uri: user?.photoURL || profile_image }}
                      style={{ width: "100%", height: "100%", borderRadius: 8 }}
                      contentFit="cover"
                    />
                    {isUploading && (
                      <ActivityIndicator
                        size="large"
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: [{ translateX: -25 }, { translateY: -25 }],
                        }}
                      />
                    )}
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => handleImageUpload(setFieldValue)}
                  style={[
                    styles.addProfileCard,
                    { alignItems: "center", justifyContent: "center" },
                  ]}
                >
                  <Feather name="plus" size={32} />
                </TouchableOpacity>
              </View>
              <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                Name
              </Text>
              <Input
                value={name}
                onChangeText={handleChange("name")}
                placeholder="Enter your name"
                style={{ marginBottom: 28 }}
              />
              <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                Bio
              </Text>
              <TextArea
                onChangeText={handleChange("bio")}
                value={bio}
                placeholder="Tell us about you"
                style={{ marginBottom: 28 }}
              />
              <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                What City Are You in
              </Text>
              <Input
                value={city}
                onChangeText={handleChange("city")}
                placeholder="Enter your city"
                style={{ marginBottom: 28 }}
              />
              <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                Your Workout Style
              </Text>
              <Select
                options={[
                  { label: "Pushing It", value: "Pushing It" },
                  { label: "Recreational", value: "Recreational" },
                ]}
                inputStyle={{ height: 56 }}
                style={{ marginBottom: 28 }}
                placeholder="Add workout style"
                modalTitle="Workout Style"
                selectedValue={workout_style}
                // @ts-ignore
                onValueChange={handleChange("workout_style")}
              />
              <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                Your Availability
              </Text>
              <MultiSelect
                options={[
                  { label: "Weekdays", value: "Weekdays" },
                  { label: "Weekends", value: "Weekends" },
                  { label: "Morning", value: "Morning" },
                  { label: "Afternoons", value: "Afternoons" },
                  { label: "Evenings", value: "Evenings" },
                ]}
                modalTitle="Availability"
                selectedValues={availability}
                onValueChange={(values) =>
                  setFieldValue("availability", values)
                }
                style={{ marginBottom: 28, height: 56 }}
              />
              <Text variant="titleSmall" style={{ marginBottom: 10 }}>
                Prompt
              </Text>
              {prompt?.map((p, i) => (
                <TouchableOpacity
                  key={i}
                  style={{
                    borderWidth: 1,
                    borderRadius: 8,
                    borderColor: "#cfcece",
                    // alignItems: "",
                    justifyContent: "space-between",
                    padding: 10,
                    marginBottom: 28,
                    flex: 1,
                  }}
                  // onPress={() => setVisibility(true)}
                >
                  <Text variant="titleSmall">{p?.q}</Text>
                  <Text>{p?.a}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={{
                  height: 56,
                  borderWidth: 1,
                  borderRadius: 8,
                  borderColor: "#cfcece",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  paddingHorizontal: 10,
                  marginBottom: 28,
                }}
                onPress={() => setVisibility(true)}
              >
                <Text>Add Prompt</Text>
                <MaterialIcons name="add" size={24} color="#A5A1A1" />
                <PromptModal
                  setVisibility={setVisibility}
                  visibility={visibility}
                  prompt={prompt}
                  setFieldValue={setFieldValue}
                />
              </TouchableOpacity>
              <Button
                onPress={handleSubmit}
                title={"Complete Profile"}
                disabled={
                  loading ||
                  name === "" ||
                  name === undefined ||
                  bio === "" ||
                  bio === undefined ||
                  city === "" ||
                  workout_style === "" ||
                  preferences?.length === 0 ||
                  availability?.length === 0 ||
                  prompt?.length === 0
                }
              >
                Complete Profile
              </Button>
            </>
          )}
        </Formik>
      </ScrollView>
      <Modal visible={loading}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  addProfileCard: {
    flex: 1,
    height: 190,
    // width: 100,
    borderRadius: 8,
    borderWidth: 2,
    // opacity: 1,
    borderColor: "#BAB8B8",
  },
  onboardWrapper: {
    // alignItems: "center",
  },
  // backButton: {
  //   marginTop: 30,
  // },
});

export default ProfileUpdate;
