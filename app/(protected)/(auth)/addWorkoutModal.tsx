import React, { useLayoutEffect, useRef } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors.ts";
import { supabase } from "@/config/initSupabase.ts";
import { useAuth } from "@/context/AuthProvider.tsx";
import Toast from "react-native-root-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Divider, Text } from "react-native-paper";
import Input from "@/components/input.tsx";

// Validation schema for the form
const WorkoutSchema = Yup.object().shape({
  // time: Yup.number()
  //   .typeError("Please enter a valid number")
  //   .positive("Time must be a positive number")
  //   .required("Time is required"),
  // days: Yup.number()
  //   .typeError("Please enter a valid number")
  //   .integer("Days must be an integer")
  //   .min(0, "Days must be at least 0")
  //   .required("Days are required"),
  // weeks: Yup.number()
  //   .typeError("Please enter a valid number")
  //   .integer("Weeks must be an integer")
  //   .min(0, "Weeks must be at least 0")
  //   .required("Weeks are required"),
  // months: Yup.number()
  //   .typeError("Please enter a valid number")
  //   .integer("Months must be an integer")
  //   .min(0, "Months must be at least 0")
  //   .required("Months are required"),
});

const AddWorkout = () => {
  const { user } = useAuth();
  const { item } = useLocalSearchParams();
  const workout = JSON.parse(item);
  const navigation = useNavigation();
  const formikRef = useRef(null); // Create a ref for Formik
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: Colors.ecru800 },
      headerShown: true,
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()}>
          <Text variant="titleMedium" style={{ color: "#fff" }}>
            Cancel
          </Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={() => formikRef.current?.submitForm()}>
          <Text variant="titleMedium" style={{ color: "#fff" }}>
            Add
          </Text>
        </TouchableOpacity>
      ),
      headerTitle: "Create Workout",
      headerTitleAlign: "center",
      headerTitleStyle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
      },
    });
  }, []);

  const handleSubmit = async (values) => {
    console.log("Submitted data:", values);

    const userId = user?.id; // Replace with the current user's ID

    // Create the duration object
    const duration = {
      hours: parseInt(values.hours, 10),
      minutes: parseInt(values.minutes, 10),
    };

    // Insert into Supabase
    const { data, error } = await supabase.from("user_workouts").insert([
      {
        workout_id: workout.id, // Ensure workout has an ID field
        user_id: userId,
        noOfDays: parseInt(values.noOfDays, 10), // Ensure this matches your DB schema
        duration: duration,
      },
    ]);

    if (error) {
      console.error("Error inserting workout:", error);
    } else {
      console.log("Workout added:", data);
      await queryClient.invalidateQueries(["workoutHistories"]);
      Toast.show("Workout added successfully", {
        position: Toast.positions.TOP,
        duration: Toast.durations.LONG,
        backgroundColor: "green",
      });

      // Optionally navigate back or show success message
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={() => (
          <Formik
            innerRef={formikRef} // Attach Formik to the ref
            initialValues={{
              workoutType: workout?.name,
              noOfDays: "",
              // days: "",
              hours: "",
              minutes: "",
            }}
            validationSchema={WorkoutSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, values, errors, touched }) => (
              <>
                <View
                  style={{
                    backgroundColor: "#f8f7f6",
                    padding: 16,
                    borderRadius: 8,
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginVertical: 16,
                    }}
                  >
                    <Text variant="titleMedium">Workout type</Text>
                    <Text size="md">{workout?.name}</Text>
                  </View>
                  <Divider />

                  {/* Time Input */}
                  <View style={styles.inputRow}>
                    <Text variant="titleMedium">Number of Days</Text>
                    <View style={{ width: "20%" }}>
                      <Input
                        placeholder="10"
                        containerStyle={{ height: 36 }}
                        inputContainerStyle={styles.inputContainer}
                        keyboardType="numeric"
                        value={values.noOfDays}
                        onChangeText={handleChange("noOfDays")}
                        onBlur={handleBlur("noOfDays")}
                        errorMessage={
                          touched.noOfDays && errors.noOfDays
                            ? errors.noOfDays
                            : ""
                        }
                      />
                    </View>
                  </View>
                  <Divider />

                  {/* Duration Inputs */}
                  <View
                    style={{
                      // flex: 1,
                      flexDirection: "row",
                      // width: "100%",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text variant="titleMedium" style={{}}>
                      Hour per Day
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        // flex: 1,
                      }}
                    >
                      {/* Day Input */}
                      <View style={styles.durationInput}>
                        <Input
                          placeholder="00"
                          maxLength={2}
                          containerStyle={{ height: 36, marginBottom: 5 }}
                          inputContainerStyle={styles.inputContainer}
                          keyboardType="numeric"
                          value={values.hours}
                          onChangeText={handleChange("hours")}
                          onBlur={handleBlur("hours")}
                          errorMessage={
                            touched.hours && errors.hours ? errors.hours : ""
                          }
                        />
                        <Text style={styles.labelText}>Hours</Text>
                      </View>

                      {/* Week Input */}
                      <View style={styles.durationInput}>
                        <Input
                          placeholder="00"
                          maxLength={2}
                          containerStyle={{ height: 36, marginBottom: 5 }}
                          inputContainerStyle={styles.inputContainer}
                          keyboardType="numeric"
                          value={values.minutes}
                          onChangeText={handleChange("minutes")}
                          onBlur={handleBlur("minutes")}
                          errorMessage={
                            touched.minutes && errors.minutes
                              ? errors.minutes
                              : ""
                          }
                        />
                        <Text style={styles.labelText}>Minutes</Text>
                      </View>
                    </View>
                  </View>
                  <Divider />
                </View>
              </>
            )}
          </Formik>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  durationRow: {
    flexDirection: "row",
    // justifyContent: "space-between",
    width: "70%",
  },
  durationInput: {
    alignSelf: "flex-end",
    alignItems: "center",
    width: "30%",
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 8,
    height: 36,
  },
  labelText: {
    fontSize: 12,
    color: "#666",
  },
});

export default AddWorkout;
