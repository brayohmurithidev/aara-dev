import React from "react";
import {
  KeyboardType,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type InputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: (e: any) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  leftIcon?: React.ReactNode; // Can be any React component (button or icon)
  rightIcon?: React.ReactNode; // Can be any React component (button or icon)
  onLeftIconPress?: () => void; // Callback for left icon press
  onRightIconPress?: () => void; // Callback for right icon press
  style?: object; // Custom style for input container
  inputStyle?: object; // Custom style for the TextInput
  error?: string; // Error message
  errorStyle?: object; // Custom style for the error message
  keyboardType?: KeyboardType;
  onFocus?: (e: any) => void;
  numberOfLines?: number;
  multiline?: boolean;
  maxLength?: number;
  editable?: boolean;
  inputContainerStyles?: object;
};

const Input = ({
  value,
  onChangeText,
  onBlur,
  placeholder = "",
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  onLeftIconPress,
  onRightIconPress,
  style,
  inputStyle,
  inputContainerStyles,
  error,
  errorStyle,
  keyboardType,
  onFocus,
  multiline,
  numberOfLines,
  maxLength,
  editable,
}: InputProps) => {
  return (
    <View style={style}>
      <View
        style={[
          styles.inputContainer,
          error ? styles.errorInputContainer : {},
          inputContainerStyles,
        ]}
      >
        {leftIcon && (
          <TouchableOpacity
            onPress={onLeftIconPress}
            disabled={!onLeftIconPress}
          >
            {leftIcon}
          </TouchableOpacity>
        )}
        <TextInput
          style={[styles.input, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          placeholderTextColor="#A5A1A1"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          maxLength={maxLength}
          numberOfLines={numberOfLines}
          editable={editable}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  errorInputContainer: {
    borderColor: "red", // Change border color on error
  },
  errorText: {
    color: "red",
    marginTop: 5,
    fontSize: 14,
  },
});

export default Input;
