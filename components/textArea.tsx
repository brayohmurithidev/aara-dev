import { StyleSheet, TextInput, View } from "react-native";
import React from "react";

type TextAreaProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  style?: object;
};

const TextArea = ({
  value,
  onChangeText,
  placeholder,
  style,
}: TextAreaProps) => {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        placeholderTextColor="#A5A1A1"
        multiline
        numberOfLines={4}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        textAlignVertical="top" // Ensures text starts at the top
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 98,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 98, // Ensure it starts at the correct height
    paddingVertical: 10, // Padding for spacing inside text area
    flexWrap: "wrap",
  },
});

export default TextArea;
