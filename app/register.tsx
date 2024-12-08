import {Alert, KeyboardAvoidingView, ScrollView, StyleSheet, View,} from "react-native";
import React, {useEffect, useState} from "react";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {Formik} from "formik";
import {Colors} from "@/constants/Colors.ts";
import {Link, router} from "expo-router";
import {StatusBar} from "expo-status-bar";
import * as Yup from "yup";
import {supabase} from "@/config/initSupabase.ts";
import Toast from "react-native-root-toast";
import {getDataFromAsyncStorage, storeToAsyncStorage,} from "@/utils/asyncStore.ts";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {Button, Checkbox, Text, TextInput} from "react-native-paper";

GoogleSignin.configure({
  webClientId:
    "463974930869-go42mjt8pg5702v08bi766h7mcne1pk0.apps.googleusercontent.com",
  iosClientId:
    "463974930869-3bmt93irvbht9l81r0fpkpr30uvck8l2.apps.googleusercontent.com", // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
});

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password should be at least 8 characters"),
  agreeTerms: Yup.boolean().oneOf(
    [true],
    "You must agree to the terms and conditions",
  ),
});

const SignUp = () => {
  const { top } = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    password: "",
    agreeTerms: false,
  });

  // LOAD DATA
  useEffect(() => {
    const loadStoredValues = async () => {
      try {
        const storedValues = await getDataFromAsyncStorage("basicData");
        if (storedValues) {
          setInitialValues(storedValues);
        }
      } catch (error) {
        console.log("Error loading async storage data", error);
      }
    };

    loadStoredValues();
  }, []);

  // CHECK IF EMAIL EXIST
  async function isEmailRegistered(email: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .match({ email: email.toLowerCase() });

      if (error) throw error;

      return data.length > 0;
    } catch (error) {
      console.error("Error checking email registration:", error);
      return false;
    }
  }

  // const handle signup
  const handleSignUp = async (values: {
    name: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const isRegistered = await isEmailRegistered(values?.email);
      if (isRegistered) {
        Toast.show(
          "Email is already registered, check your email and try again",
          {
            duration: Toast.durations.LONG,
            position: Toast.positions.TOP,
            backgroundColor: "red",
            textColor: "#fff",
            textStyle: {
              fontSize: 16,
              fontWeight: "700",
            },
          },
        );
        // Alert.alert("Email is already registered, Login");
      } else {
        await storeToAsyncStorage("basicData", values);
        router.push("/completeProfile");
      }
    } catch (error: any) {
      Alert.alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: top }]}
      behavior={"padding"}
      keyboardVerticalOffset={top}
    >
      <ScrollView
        contentContainerStyle={styles.mainWrapper}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="titleLarge" style={styles.title}>
          Create an Account
        </Text>
        <Text variant="titleSmall" style={{ marginTop: 10, marginBottom: 24 }}>
          Join us and start your fitness journey today!
        </Text>
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={(values) => handleSignUp(values)}
        >
          {({
            handleBlur,
            handleChange,
            handleSubmit,
            values: { email, password, agreeTerms, name },
            errors,
            touched,
            setFieldValue,
          }) => (
            <>
              <View style={styles.formControl}>
                <Text variant="titleSmall" style={styles.inputText}>
                  Enter full name
                </Text>
                <TextInput
                  mode="outlined"
                  value={name}
                  onBlur={handleBlur("name")}
                  onChangeText={handleChange("name")}
                  placeholder="John Doe"
                />
                {touched.name && errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>
              <View style={styles.formControl}>
                <Text variant="titleSmall" style={styles.inputText}>
                  Enter Email
                </Text>
                <TextInput
                  mode={"outlined"}
                  value={email}
                  onBlur={handleBlur("email")}
                  onChangeText={handleChange("email")}
                  placeholder="you@example.com"
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>
              <View style={styles.formControl}>
                <Text variant="titleSmall" style={styles.inputText}>
                  Create Password
                </Text>
                <TextInput
                  mode="outlined"
                  placeholder="Choose a secure password"
                  secureTextEntry={!showPassword}
                  onChangeText={handleChange("password")}
                  value={password}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  onBlur={handleBlur("password")}
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Checkbox.Android
                  status={agreeTerms ? "checked" : "unchecked"}
                  onPress={() => {
                    setFieldValue("agreeTerms", !agreeTerms);
                  }}
                />
                <Text style={{ flex: 1 }} variant="bodyMedium">
                  By continuing you accept our Privacy Policy and Terms of Use
                </Text>
              </View>

              {/*<Checkbox*/}
              {/*  style={{ flex: 1, marginHorizontal: 20 }}*/}
              {/*  label="By continuing you accept our Privacy Policy and Term of Use"*/}
              {/*  checked={agreeTerms}*/}
              {/*  onChange={() => setFieldValue("agreeTerms", !agreeTerms)}*/}
              {/*/>*/}
              {touched.agreeTerms && errors.agreeTerms && (
                <Text style={styles.errorText}>{errors.agreeTerms}</Text>
              )}

              <Button
                onPress={handleSubmit}
                // disabled={
                //   email === "" || password === "" || agreeTerms === false
                // }
                loading={isLoading}
                style={{
                  marginTop: 24,
                  width: "100%",
                  marginBottom: 16,
                  borderRadius: 16,
                }}
                mode={"contained"}
              >
                Sign up
              </Button>

              {/*<Button*/}
              {/*  onPress={handleSubmit}*/}
              {/*  disabled={*/}
              {/*    email === "" || password === "" || agreeTerms === false*/}
              {/*  }*/}
              {/*  title="Continue"*/}
              {/*  style={{ width: "100%", marginBottom: 16, marginTop: 24 }}*/}
              {/*/>*/}
              {/*<Divider text="or Sign Up with" />*/}
              {/*<GoogleSigninButton*/}
              {/*  size={GoogleSigninButton.Size.Wide}*/}
              {/*  onPress={async () => {*/}
              {/*    try {*/}
              {/*      await GoogleSignin.hasPlayServices();*/}
              {/*      const userInfo = await GoogleSignin.signIn();*/}
              {/*      if (userInfo.data?.idToken) {*/}
              {/*        const { data, error } =*/}
              {/*          await supabase.auth.signInWithIdToken({*/}
              {/*            provider: "google",*/}
              {/*            token: userInfo.data.idToken,*/}
              {/*          });*/}
              {/*        console.log(error, data);*/}
              {/*      } else {*/}
              {/*        throw new Error("No ID TOKEN PRESENT");*/}
              {/*      }*/}
              {/*    } catch (error: any) {*/}
              {/*      if (error.code === statusCodes.SIGN_IN_CANCELLED) {*/}
              {/*        Alert.alert("User canceled the login flow");*/}
              {/*      } else if (error.code === statusCodes.IN_PROGRESS) {*/}
              {/*        console.log("Signing in progress");*/}
              {/*      } else if (*/}
              {/*        error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE*/}
              {/*      ) {*/}
              {/*        Alert.alert("Play services not available or outdated");*/}
              {/*      } else {*/}
              {/*        console.log("Google signup error", error);*/}
              {/*      }*/}
              {/*    }*/}
              {/*  }}*/}
              {/*  // color={GoogleSigninButton.Color.Light}*/}
              {/*/>*/}

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text>Don't have an account? </Text>
                <Link href="/login">
                  <Text variant="bodyMedium" style={{textDecorationLine: "underline", textDecorationColor: Colors.ecru800, color:Colors.ecru800}}>Login</Text>
                </Link>
              </View>
            </>
          )}
        </Formik>
      </ScrollView>
      <StatusBar backgroundColor={Colors.baseWhite} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: Colors.baseWhite,
  },
  mainWrapper: {
    alignItems: "center",
  },
  title: {
    marginTop: 60,
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

export default SignUp;
