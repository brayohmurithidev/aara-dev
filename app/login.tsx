import {KeyboardAvoidingView, ScrollView, StyleSheet, View,} from "react-native";
import React, {useState} from "react";
import {Image} from "expo-image";

import {StatusBar} from "expo-status-bar";
import {Formik} from "formik";
import {Link, router} from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import * as Yup from "yup";
import {Button, Portal, Snackbar, Text, TextInput} from "react-native-paper";
import {monoBlack} from "@/constants/images";
import {Colors} from "@/constants/Colors";
import Divider from "@/components/divider";
import {supabase} from "@/config/initSupabase.ts";
import GoogleLogin from "@/components/GoogleLogin.tsx";

const validationSchema = Yup.object({
  identifier: Yup.string().required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const SignIn = () => {
  const { top } = useSafeAreaInsets();
  // const headerHeight = useHeaderHeight();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // const { signInWithPassword } = useSupabase();

  const handleSignIn = async (values: {
    identifier: string;
    password: string;
  }) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values?.identifier,
      password: values?.password,
    });
    if (error) {
      console.log("Logging in error", error?.message);
      setErrorMessage(
        error?.message === "Invalid login credentials"
          ? "Wrong Email or password"
          : error?.message,
      );
    }
    setLoading(false);
    router.replace('/(tabs)')
  };

  return (
    <>
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: top }]}
        behavior={"padding"}
        keyboardVerticalOffset={top}
      >
        <ScrollView
          contentContainerStyle={styles.onboardWrapper}
          showsVerticalScrollIndicator={false}
        >
          <Image source={monoBlack} style={styles.logo} contentFit="contain" />
          <Text
            variant="titleSmall"
            style={[styles.title, errorMessage && { marginBottom: 20 }]}
          >
            Welcome Back! Continue Your Fitness Journey.
          </Text>
          {/*FORM */}

          <Formik
            initialValues={{ identifier: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSignIn}
          >
            {({
              handleBlur,
              handleChange,
              handleSubmit,
              touched,
              errors,
              values: { identifier, password },
            }) => (
              <>
                {errorMessage && (
                  <Portal>
                    <Snackbar
                      visible={errorMessage}
                      onDismiss={() => setErrorMessage(null)}
                    >
                      {errorMessage}
                    </Snackbar>
                  </Portal>

                  // <View
                  //   style={{
                  //     marginBottom: 20,
                  //     backgroundColor: "red",
                  //     width: "100%",
                  //     padding: 10,
                  //     justifyContent: "center",
                  //     alignItems: "center",
                  //     borderRadius: 8,
                  //   }}
                  // >
                  //   <Text style={{ color: Colors.baseWhite }}>
                  //     {errorMessage}
                  //   </Text>
                  // </View>
                )}
                <View style={styles.formControl}>
                  <TextInput
                    mode="outlined"
                    label="Email"
                    placeholder="Enter username/email"
                    // style={styles.input}
                    onChangeText={handleChange("identifier")}
                    onBlur={handleBlur("identifier")}
                    onFocus={() => setErrorMessage(null)}
                    error={touched.identifier && errors.identifier}
                    value={identifier}
                    activeOutlineColor={Colors.ecru800}
                  />
                  {touched.identifier && errors.identifier && (
                    <Text style={styles.errorText}>{errors.identifier}</Text>
                  )}
                </View>
                <View style={styles.formControl}>
                  <TextInput
                    mode="outlined"
                    label="Password"
                    placeholder="Enter your password"
                    right={
                      <TextInput.Icon
                        icon={showPassword ? "eye-off" : "eye"}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    // style={styles.input}
                    secureTextEntry={!showPassword}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    onFocus={() => setErrorMessage(null)}
                    error={touched.password && errors.password}
                    value={password}
                  />

                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                <Link href="/" style={{ marginBottom: 20 }}>
                  <Text>Forgot password?</Text>
                </Link>
                <Button
                  mode="contained"
                  // buttonColor="#000"
                  // textColor="#fff"
                  style={{ width: "100%" }}
                  onPress={handleSubmit}
                  // disabled={identifier === "" || password === ""}
                  loading={loading}
                >
                  Login
                </Button>
                {/* <Button
                  title="Login"
                  containerStyle={{
                    width: "100%",
                    marginBottom: 16,
                    // borderWidth: 2,
                    // borderRadius: 16,
                    borderColor: Colors.mainButtonBackground,
                  }}
                  buttonStyle={{ backgroundColor: Colors.mainButtonBackground }}
                  disabled={identifier.length === 0 || password.length === 0}
                  loading={loading}
                  onPress={handleSubmit}
                /> */}

                <Divider text="or login with" />
                <GoogleLogin />

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text>Don't have an account? </Text>
                  <Link href="/">
                    <Text variant="titleSmall">Sign up</Text>
                  </Link>
                </View>
              </>
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
    // marginBottom: 16,
  },
  onboardWrapper: {
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 100,

    // marginBottom: 60,
    marginVertical: 60,
  },
  formControl: {
    width: "100%",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 60,
    width: "80%",
  },
  input: {
    width: "100%",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginTop: 5,
  },
});

export default SignIn;
