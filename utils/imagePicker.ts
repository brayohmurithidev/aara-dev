import * as ImagePicker from "expo-image-picker";

import { Alert } from "react-native";

export const pickImage = async () => {
  try {
    //     Ask for camera roll permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "You need to grant camera permission to select your image",
      );
      return null;
    }
    //     Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, //allow only images
      allowsEditing: true, // allow crop e.t.c
      aspect: [4, 3],
      quality: 1, // best quality
      // base64: true,
    });

    if (!result.canceled) {
      return result;
    }

    return null; //if user cancels selection
  } catch (error) {
    console.error("Error picking an image: ", error);
    Alert.alert("Error", "Something went wrong while picking an image");
    return null;
  }
};
