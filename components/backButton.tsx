import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { chevronLeft } from "@/constants/images";
import { useRouter } from "expo-router";

type BackButtonProps = {
  buttonStyles?: object;
};

const BackButton = ({ buttonStyles }: BackButtonProps) => {
  const router = useRouter();
  return (
    <View>
      <TouchableOpacity
        style={[styles.backButton, buttonStyles]}
        onPress={() => router.back()}
      >
        <Image source={chevronLeft} style={{ width: "100%", height: "100%" }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginTop: 30,
    width: 32,
    height: 32,
  },
});

export default BackButton;
