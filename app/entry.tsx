import { View } from "react-native";
import React from "react";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";
import { logoBlack } from "@/constants/images";
import { router } from "expo-router";

const EntryFile = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.softLime,
      }}
    >
      <View
        style={{
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={logoBlack}
          style={{ width: 200, height: 100 }}
          contentFit="contain"
        />
        <Text variant="titleSmall">Community through fitness</Text>
        <View style={{ bottom: 60, position: "absolute", width: "80%" }}>
          {/*<Button*/}
          {/*  mode={"contained"}*/}
          {/*  onPress={() => router.push("/(auth)/(tabs)")}*/}
          {/*  style={{ marginBottom: 24 }}*/}
          {/*>*/}
          {/*  Home Screen*/}
          {/*</Button>*/}
          <Button
            mode="contained"
            buttonColor="black"
            style={{ marginBottom: 20 }}
            onPress={() => router.push("/introduction")}
          >
            SIGN UP
          </Button>
          <Button
            mode="text"
            textColor="#000"
            onPress={() => router.push("/login")}
          >
            LOGIN
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EntryFile;
