import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// @ts-ignore
import { Image } from "expo-image";
import { calendar, camera } from "@/constants/images.ts";
import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import Input from "@/components/input.tsx";
import Select from "@/components/select.tsx";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { useRouter } from "expo-router";
import {
  getDataFromAsyncStorage,
  storeToAsyncStorage,
} from "@/utils/asyncStore.ts";
import * as Yup from "yup";
import dayjs from "dayjs";
import { pickImage } from "@/utils/imagePicker.ts";
import { uploadImageAndStoreURL } from "@/config/supabase_service.ts";
import { Button, Text } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";

type DateProps = {
  type: string;
};
type FormProps = {
  image: any;
  profile_image?: string | null;
  gender: string;
  birthday: object;
  weight: { value: string; unit: string };
  height: { value: string; unit: string };
};

const validationSchema = Yup.object({
  gender: Yup.string().required("Gender is required"),
  birthday: Yup.string().required("Birthday is required"),
  weight: Yup.object({
    value: Yup.string().required("Weight is required"),
  }),
  height: Yup.object({
    value: Yup.string().required("Height is required"),
  }),
});

const CompleteProfile = () => {
  const { top, bottom } = useSafeAreaInsets();
  // const headerHeight = useHeaderHeight();
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [image, setImage] = useState(null);
  const [initialValues, setInitialValues] = useState<FormProps>({
    image: null,
    profile_image: null,
    gender: "",
    birthday: new Date(),
    weight: { value: "", unit: "KG" },
    height: { value: "", unit: "CM" },
  });
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  // LOAD DATA
  useEffect(() => {
    const loadStoredValues = async () => {
      try {
        const storedValues = await getDataFromAsyncStorage("completeProfile");
        if (storedValues) {
          setInitialValues(storedValues);
          setDate(new Date(storedValues?.birthday));
        }
      } catch (error) {
        console.log("Error loading async storage data", error);
      }
    };

    loadStoredValues();
  }, []);

  const handleImageUpload = async (setFieldValue: any) => {
    try {
      setIsUploading(true);
      const image = await pickImage();
      if (image) {
        setFieldValue("image", image?.assets[0].uri);
        const initialFilename = image?.assets[0]?.uri?.split("/").pop();
        const fileName = `profile-${initialFilename}`;

        const imageUrl: string | null = await uploadImageAndStoreURL(
          image?.assets[0].uri,
          fileName,
        );
        if (imageUrl) {
          setFieldValue("profile_image", imageUrl);
        }
      } else {
        console.log("No image");
      }
    } catch (error) {
      console.log("Upload image error", error);
    } finally {
      setIsUploading(false);
    }
  };

  // // IMAGE SELECT
  // const handleImageSelect = async (setFieldValue: any) => {
  //   const res = await pickImage();
  //   console.log("Picking image", res);
  //   setFieldValue("image", res);
  // };

  // HANDLE DATA SUBMIT
  const handleSubmit = async (values: FormProps) => {
    try {
      await storeToAsyncStorage("completeProfile", {
        ...values,
        birthday: date,
      });
      // console.log(values?.image)
      router.push("/selectFitnessLevel");
    } catch (error) {
      console.error("failed to save data", error);
    }
  };

  // ON DATE CHANGE
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  // DATES
  const onDismiss = useCallback(() => {
    setShowPicker(false);
  }, [setShowPicker]);

  const onConfirm = useCallback(
    (params) => {
      setShowPicker(false);
      setDate(params.date);
    },
    [setShowPicker, setDate],
  );

  // @ts-ignore
  // @ts-ignore
  return (
    <>
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: top }]}
        behavior={"padding"}
        keyboardVerticalOffset={top}
      >
        <ScrollView
          contentContainerStyle={[styles.mainWrapper]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps={"handled"}
          contentInsetAdjustmentBehavior="always"
        >
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              values: { gender, birthday, weight, height, image },
              handleSubmit,
              setFieldValue,
              errors,
              touched,
              handleBlur,
            }) => (
              <View style={styles.formWrapper}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    style={styles.uploadImage}
                    onPress={() => handleImageUpload(setFieldValue)}
                  >
                    {image ? (
                      <Image
                        // @ts-ignore
                        source={{ uri: image }}
                        style={[styles.uploadImage]}
                        contentFit={"cover"}
                      />
                    ) : (
                      <Image
                        // @ts-ignore
                        source={camera}
                        style={styles.uploadImageIcon}
                        contentFit={"contain"}
                      />
                    )}
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
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleImageUpload(setFieldValue)}
                  >
                    <Text variant="titleMedium" style={styles.uploadImageText}>
                      {image ? "Change" : "Add"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text variant="titleMedium" style={styles.title}>
                  Complete Your Profile
                </Text>
                <Text variant="bodyMedium" style={{ marginBottom: 40 }}>
                  Help us get to know you better!
                </Text>

                <View style={styles.formControl}>
                  <Text variant="titleMedium" style={styles.inputText}>
                    Choose your gender
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
                    // @ts-ignore
                    onValueChange={handleChange("gender")}
                  />
                </View>
                <View style={styles.formControl}>
                  <Text variant="titleMedium" style={styles.inputText}>
                    When is your birthday?
                  </Text>
                  <Pressable
                    style={styles.birthdayInput}
                    onPress={() => setShowPicker(true)}
                  >
                    <View style={styles.dateInput}>
                      <Text>
                        {
                          // @ts-ignore
                          dayjs(date).format("MM / DD / YYYY")
                        }
                      </Text>
                    </View>
                    <View style={styles.calendarIconWrapper}>
                      <Image
                        source={calendar}
                        style={styles.calendarIcon}
                        contentFit="contain"
                      />
                    </View>
                  </Pressable>
                </View>
                <View style={styles.formControl}>
                  <Text variant="titleMedium" style={styles.inputText}>
                    What is your weight and height?
                  </Text>
                  <View style={styles.measureWrapper}>
                    <View style={styles.weightWrapper}>
                      <Input
                        style={{ marginRight: 4, flex: 1 }}
                        placeholder="Your weight"
                        value={weight.value}
                        onChangeText={handleChange("weight.value")}
                        keyboardType="numeric"
                        onBlur={handleBlur("weight.value")}
                      />
                      <Select
                        options={[
                          { label: "KG", value: "kg" },
                          { label: "LBS", value: "lbs" },
                        ]}
                        inputStyle={{
                          height: 56,
                          width: 56,
                          backgroundColor: "#6F5C50",
                        }}
                        placeholder="KG"
                        selectedValue={weight.unit}
                        iconColor="#fff"
                        iconSize={16}
                        selectedTextStyles={{ fontSize: 15, color: "#fff" }}
                        // @ts-ignore
                        onValueChange={handleChange("weight.unit")}
                      />
                    </View>
                    <View style={styles.weightWrapper}>
                      <Input
                        style={{ marginRight: 4, flex: 1 }}
                        placeholder="Your height"
                        value={height.value}
                        onChangeText={handleChange("height.value")}
                        keyboardType="numeric"
                        onBlur={handleBlur("height.value")}
                      />
                      <Select
                        options={[
                          { label: "CM", value: "cm" },
                          { label: "Inch", value: "inch" },
                        ]}
                        inputStyle={{
                          height: 56,
                          paddingVertical: 0,
                          width: 56,
                          backgroundColor: "#6F5C50",
                        }}
                        placeholder="CM"
                        selectedValue={height.unit}
                        iconColor="#fff"
                        iconSize={16}
                        selectedTextStyles={{ fontSize: 16, color: "#fff" }}
                        // @ts-ignore
                        onValueChange={handleChange("height.unit")}
                      />
                    </View>
                  </View>
                  {touched.weight && errors.weight && (
                    <Text style={styles.errorText}>{errors.weight.value}</Text>
                  )}
                  {touched.height && errors.height && (
                    <Text style={styles.errorText}>{errors.height.value}</Text>
                  )}
                </View>

                {/* Show Modal only on iOS */}
                {/*{Platform.OS === "ios" && (*/}
                {/*  <Modal*/}
                {/*    transparent={true}*/}
                {/*    animationType="slide"*/}
                {/*    visible={showPicker}*/}
                {/*  >*/}
                {/*    <View style={styles.modalContainer}>*/}
                {/*      <View style={styles.pickerContainer}>*/}
                {/*        <Text style={styles.title}>Select Date</Text>*/}

                {/*        <RNDateTimePicker*/}
                {/*          value={date}*/}
                {/*          mode="date"*/}
                {/*          display={*/}
                {/*            Platform.OS === "ios" &&*/}
                {/*            parseInt(Platform.Version) >= 18*/}
                {/*              ? "inline"*/}
                {/*              : "spinner"*/}
                {/*          }*/}
                {/*          // display="spinner" // Use 'spinner' for iOS-style appearance*/}
                {/*          onChange={onChange}*/}
                {/*          style={[styles.datePicker]} // Apply styles here*/}
                {/*          themeVariant="light"*/}
                {/*        />*/}

                {/*        <Button*/}
                {/*          onPress={() => setShowPicker(false)}*/}
                {/*          */}
                {/*        >Done</Button>*/}
                {/*      </View>*/}
                {/*    </View>*/}
                {/*  </Modal>*/}
                {/*)}*/}

                <DatePickerModal
                  visible={showPicker}
                  locale={"en"}
                  mode={"single"}
                  date={date}
                  onDismiss={onDismiss}
                  onConfirm={onConfirm}
                />

                {/* Show DatePicker for Android */}
                {/*{Platform.OS === "android" && showPicker && (*/}
                {/*  <RNDateTimePicker*/}
                {/*    value={date}*/}
                {/*    mode="date"*/}
                {/*    display="default"*/}
                {/*    onChange={onChange}*/}
                {/*  />*/}
                {/*)}*/}

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 56,
                    width: "100%",
                    marginTop: 24,
                    marginBottom: 100,
                  }}
                >
                  <AnimatedCircularProgress
                    size={70}
                    width={10}
                    fill={25}
                    tintColor="#201C1C"
                    backgroundColor="#E4E4E4"
                  >
                    {() => (
                      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                        1 / 4
                      </Text>
                    )}
                  </AnimatedCircularProgress>

                  <Button
                    style={{ width: 120 }}
                    mode="contained"
                    onPress={handleSubmit}
                    buttonTextStyles={{ fontSize: 18 }}
                    disabled={
                      gender === "" ||
                      weight.value === "" ||
                      height.value === ""
                    }
                    icon="arrow-right"
                  >
                    Next
                  </Button>
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="dark" />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    padding: 20,
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  datePicker: {
    width: "100%",
  },
  doneButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedDateText: {
    marginTop: 20,
    fontSize: 16,
  },
  mainWrapper: {
    // alignItems: "center",
    marginTop: 40,
  },
  backButton: {
    marginTop: 30,
  },
  formWrapper: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
  uploadImage: {
    width: 88,
    height: 88,
    left: 2.5,
    borderRadius: 360,
    marginBottom: 5,
    backgroundColor: "#E4E4E4",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadImageIcon: {
    width: 32,
    height: 32,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
  },
  uploadImageText: { color: "#201C1C", marginBottom: 30 },
  title: { marginBottom: 8 },
  formControl: {
    width: "100%",
    marginBottom: 20,
  },
  inputText: {
    marginBottom: 10,
  },

  birthdayInput: {
    flexDirection: "row",
    width: "100%",
  },
  dateInput: {
    justifyContent: "center",
    flex: 1,
    // alignItems: "center",
    borderWidth: 1,
    borderColor: "#CFCECE",
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 10,
    height: 56,
  },
  calendarIconWrapper: {
    width: 56,
    height: 56,
    backgroundColor: "#E1DAD5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarIcon: {
    width: 32,
    height: 32,
  },
  measureWrapper: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
    // justifyContent: "space-between",
  },
  weightWrapper: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  unitWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#6F5C50",
  },
  unitText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginRight: 5,
  },
  unitSelectIcon: {
    width: 12,
    height: 12,
    color: "#fff",
  },
  iosDatePicker: {
    height: 300,
    marginTop: -100,
  },
  errorText: {
    color: "red",
    marginTop: 5,
    fontSize: 14,
  },
});

export default CompleteProfile;
