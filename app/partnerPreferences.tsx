import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Formik } from "formik";
import Input from "@/components/input.tsx";
import Select from "@/components/select.tsx";
import MultiSelect from "@/components/multiSelect.tsx";
import useLocation from "@/hooks/useLocation.tsx";
import {
  deleteItemFromAsyncStorage,
  getDataFromAsyncStorage,
  storeToAsyncStorage,
} from "@/utils/asyncStore.ts";
import Modal from "@/components/modal.tsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthProvider.tsx";
import Toast from "react-native-root-toast";
import { supabase } from "@/config/initSupabase.ts";
import { Button, Text } from "react-native-paper";
// import {getFirestore} from "@react-native-firebase/firestore";

type PartnerPreferencesProps = {
  city: string;
  radius: string;
  gender: string;
  fitnessLevel: string;
  availability: [];
  workoutType: string;
  workoutStyle: string;
  workoutGoal: string;
};

const PartnerPreferences = () => {
  const { top } = useSafeAreaInsets();
  const [isLoading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    city: "",
    radius: "",
    gender: "",
    fitnessLevel: "",
    availability: [],
    workoutType: "",
    workoutStyle: "",
    workoutGoal: "",
  });
  // const headerHeight = useHeaderHeight();
  const { location, errorMsg, currentCity } = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedValues =
          await getDataFromAsyncStorage("partnerPreferences");
        if (storedValues) {
          setInitialValues(storedValues);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (currentCity) {
      setInitialValues({ ...initialValues, city: currentCity[0]?.city });
    }
  }, [currentCity]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await storeToAsyncStorage("partnerPreferences", values);

      createUser();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const {
    mutate: createUser,
    isPending,
    error,
  } = useMutation({
    mutationFn: async () => {
      const [
        basicData,
        completeProfile,
        fitnessLevel,
        preferences,
        goals,
        partnerPreferences,
      ] = await Promise.all([
        getDataFromAsyncStorage("basicData"),
        getDataFromAsyncStorage("completeProfile"),
        getDataFromAsyncStorage("fitnessLevel"),
        getDataFromAsyncStorage("preferences"),
        getDataFromAsyncStorage("goals"),
        getDataFromAsyncStorage("partnerPreferences"),
      ]);

      const userData = {
        name: basicData?.name,
        email: basicData?.email,
        birthday: completeProfile?.birthday,
        gender: completeProfile?.gender,
        weight: completeProfile?.weight?.value,
        weight_unit: completeProfile?.weight?.unit,
        height: completeProfile?.height?.value,
        height_unit: completeProfile?.height?.unit,
        fitness_level: fitnessLevel?.title,
        preferences: preferences,
        fitness_goals: goals,
        partner_preferences: partnerPreferences,
        profile_image: completeProfile?.profile_image,
      };
      console.log({ userData });
      const { email, password } = basicData;
      console.log();
      const {
        data: { user },
        error: signUpError,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: basicData?.name,
            email: basicData?.email.toLowerCase(),
            birthday: completeProfile?.birthday,
            gender: completeProfile?.gender,
            weight: completeProfile?.weight?.value,
            weight_unit: completeProfile?.weight?.unit,
            height: completeProfile?.height?.value,
            height_unit: completeProfile?.height?.unit,
            fitness_level: fitnessLevel?.title,
            preferences: preferences,
            fitness_goals: goals,
            partner_preferences: partnerPreferences,
            profile_image: completeProfile?.profile_image,
          },
        },
      });

      if (signUpError) {
        console.log({ signUpError });
        throw signUpError;
      }
      return user;
    },
    onSuccess: async () => {
      await Promise.all([
        deleteItemFromAsyncStorage("basicData"),
        deleteItemFromAsyncStorage("completeProfile"),
        deleteItemFromAsyncStorage("fitnessLevel"),
        deleteItemFromAsyncStorage("preferences"),
        deleteItemFromAsyncStorage("goals"),
        deleteItemFromAsyncStorage("partnerPreferences"),
      ]);
    },
  });

  if (error) {
    console.log("Error creating user", error);
    // Alert.alert(error?.message);
    Toast.show(error?.message, {
      duration: Toast.durations.LONG,
      position: Toast.positions.TOP,
      backgroundColor: "red",
    });
  }

  if (isLoading)
    return (
      <Modal visible={isLoading}>
        <View style={{ flex: 1, height: "100%", width: "100%" }}>
          <ActivityIndicator size="large" />
        </View>
      </Modal>
    );

  // @ts-ignore
  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[
        styles.container,
        // { paddingTop: Platform.OS === "android" && top + 40 },
      ]}
    >
      <ScrollView
        contentContainerStyle={[styles.mainWrapper, { marginTop: top }]}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="titleMedium" style={[styles.title]}>
          Select Your Fitness Partner Preferences
        </Text>
        <Text
          variant="bodyMedium"
          style={{
            marginTop: 10,
            marginBottom: 40,
            width: "90%",
            textAlign: "center",
            marginHorizontal: "auto",
          }}
        >
          You can visit settings and make changes later
        </Text>
        <Formik
          initialValues={initialValues}
          enableReinitialize={true}
          onSubmit={handleSubmit}
        >
          {({
            handleBlur,
            handleChange,
            handleSubmit,
            touched,
            errors,
            values: {
              city,
              radius,
              gender,
              fitnessLevel,
              availability,
              workoutType,
              workoutStyle,
              workoutGoal,
            },
            setFieldValue,
          }) => (
            <>
              <View style={styles.formControl}>
                <Text variant="titleMedium" style={styles.inputText}>
                  What City Are They In
                </Text>
                <Input
                  value={city}
                  onBlur={handleBlur("city")}
                  onChangeText={handleChange("city")}
                  placeholder="Enter their city"
                />
                {touched.city && errors.city && (
                  <Text style={styles.errorText}>{errors.city}</Text>
                )}
              </View>
              <View style={styles.formControl}>
                <Text variant="titleMedium" style={styles.inputText}>
                  Partner Location
                </Text>
                <Input
                  value={radius}
                  onBlur={handleBlur("radius")}
                  onChangeText={handleChange("radius")}
                  placeholder="Max 5miles"
                />
                {touched.radius && errors.radius && (
                  <Text style={styles.errorText}>{errors.radius}</Text>
                )}
              </View>
              <View style={styles.formControl}>
                <Text variant="titleMedium" style={styles.inputText}>
                  Partner Gender
                </Text>
                <Select
                  options={[
                    { label: "Male", value: "male" },
                    { label: "Female", value: "female" },
                    { label: "Non-binary", value: "non-binary" },
                    { label: "Others", value: "others" },
                  ]}
                  inputStyle={{ height: 56 }}
                  placeholder="Select gender"
                  selectedValue={gender}
                  modalTitle="What's Their Gender"
                  // @ts-ignore
                  onValueChange={handleChange("gender")}
                />
              </View>
              <View style={styles.formControl}>
                <Text variant="titleMedium" style={styles.inputText}>
                  Fitness Level
                </Text>
                <Select
                  options={[
                    { label: "Beginner", value: "Beginner" },
                    { label: "Intermediate", value: "Intermediate" },
                    { label: "Advanced", value: "Advanced" },
                  ]}
                  inputStyle={{ height: 56 }}
                  placeholder="Add their level"
                  modalTitle="Fitness Level"
                  selectedValue={fitnessLevel}
                  // @ts-ignore
                  onValueChange={handleChange("fitnessLevel")}
                />
              </View>
              <View style={styles.formControl}>
                <Text variant="titleMedium" style={styles.inputText}>
                  Partners Availability
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
                />
              </View>
              <View style={styles.formControl}>
                <Text variant="titleMedium" style={styles.inputText}>
                  Partners Workout Type
                </Text>
                <Select
                  options={[
                    { label: "Yoga", value: "Yoga" },
                    { label: "Pilates", value: "Pilates" },
                    { label: "Running", value: "Running" },
                    { label: "Weight Training", value: "Weight Training" },
                    { label: "Tennis", value: "Tennis" },
                    { label: "Swimming", value: "Swimming" },
                    { label: "Cycling", value: "Cycling" },
                  ]}
                  inputStyle={{ height: 56 }}
                  placeholder="Add their workout type"
                  modalTitle="Workout Type"
                  selectedValue={workoutType}
                  // @ts-ignore
                  onValueChange={handleChange("workoutType")}
                />
              </View>
              <View style={styles.formControl}>
                <Text variant="titleMedium" style={styles.inputText}>
                  Partners Workout Styles
                </Text>
                <Select
                  options={[
                    { label: "Pushing It", value: "Pushing It" },
                    { label: "Recreational", value: "Recreational" },
                  ]}
                  inputStyle={{ height: 56 }}
                  placeholder="Add their workout style"
                  modalTitle="Workout Style"
                  selectedValue={workoutStyle}
                  // @ts-ignore
                  onValueChange={handleChange("workoutStyle")}
                />
              </View>
              <View style={styles.formControl}>
                <Text variant="titleMedium" style={styles.inputText}>
                  Partners Workout Goal
                </Text>
                <Select
                  options={[
                    { label: "Weight Loss", value: "Weight Loss" },
                    { label: "Stay Active", value: "Stay Active" },
                    { label: "Weight Lifter", value: "Weight Lifter" },
                    { label: "Get Ripped", value: "Get Ripped" },
                  ]}
                  inputStyle={{ height: 56 }}
                  placeholder="Add their workout goal"
                  modalTitle="Fitness Goal"
                  selectedValue={workoutGoal}
                  // @ts-ignore
                  onValueChange={handleChange("workoutGoal")}
                />
              </View>

              <Button
                style={{ alignSelf: "flex-end", marginBottom: 100 }}
                onPress={handleSubmit}
                mode="contained"
                // @ts-ignore
                disabled={
                  city === "" ||
                  radius === "" ||
                  gender === "" ||
                  fitnessLevel === "" ||
                  availability.length === 0 ||
                  workoutType === "" ||
                  workoutStyle === "" ||
                  workoutGoal === "" ||
                  isLoading
                }
                icon="arrow-right"
              >
                Next
              </Button>
            </>
          )}
        </Formik>
        {/*    FORM */}
        {/*<Heading */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    // backgroundColor: Colors.baseWhite,
  },
  mainWrapper: {
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    // marginTop: 60,
    // marginBottom: 60,
    // width: "80%",
  },
  formControl: {
    width: "100%",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  inputText: {
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
});

export default PartnerPreferences;
