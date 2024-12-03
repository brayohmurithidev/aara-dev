import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Divider from "@/components/divider";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Text } from "react-native-paper";

type Option = {
  label: string;
  value: string | number;
};

type SelectModalProps = {
  options: Option[];
  selectedValue?: string | number;
  onValueChange: (value: string | number) => void;
  label?: string;
  placeholder?: string;
  icon?: JSX.Element;
  modalTitle?: string;
  iconColor?: string;
  style?: object;
  labelStyle?: object;
  inputStyle?: object;
  iconSize?: number;
  selectedTextStyles?: object;
};

const Select = ({
  options,
  selectedValue,
  onValueChange,
  label,
  placeholder = "Select an option",
  icon,
  modalTitle = "Select Option",
  iconColor = "#A5A1A1",
  style,
  labelStyle,
  inputStyle,
  selectedTextStyles,
  iconSize,
}: SelectModalProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelect = (value: string | number) => {
    onValueChange(value);
  };

  const selectedLabel =
    options.find((option) => option.value === selectedValue)?.label ||
    placeholder;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TouchableOpacity
        style={[styles.selectInput, inputStyle]}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={[styles.selectedText, selectedTextStyles]}>
          {selectedLabel}
        </Text>
        {/*<Image*/}
        {/*  source={chevronDown}*/}
        {/*  style={[styles.selectIcon, iconStyles]}*/}
        {/*  contentFit="contain"*/}
        {/*/>*/}
        {icon || (
          <MaterialIcons
            name="expand-more"
            size={iconSize || 24}
            color={iconColor}
          />
        )}
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={{ fontSize: 18, color: "#A5A1A1" }}>Cancel</Text>
                {/*<Ionicons name="close" size={24} color={iconColor} />*/}
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={{ fontSize: 18, color: "#5F65E2" }}>Done</Text>
                {/*<Ionicons name="close" size={24} color={iconColor} />*/}
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <>
                  <TouchableOpacity
                    style={[styles.optionItem]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text style={styles.optionText}>{item.label}</Text>
                    <View
                      style={[
                        {
                          width: 16,
                          height: 16,
                          borderWidth: 1,
                          borderColor: "#A5A1A1",
                          borderRadius: 360,
                        },
                        selectedValue === item.value
                          ? { backgroundColor: Colors.mainButtonBackground }
                          : undefined,
                      ]}
                    ></View>
                  </TouchableOpacity>
                  <Divider />
                </>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginBottom: 20,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    color: "#333",
  },
  selectInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    // backgroundColor: "#fff",
  },
  selectedText: {
    fontSize: 16,
    color: "#201C1C",
  },
  selectIcon: {
    width: 24,
    height: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    // marginHorizontal: 8,
    backgroundColor: "#fff",
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    padding: 15,
    maxHeight: Dimensions.get("window").height * 0.4,
    minHeight: 200,
    // Add shadow for elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Android elevation
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionText: {
    fontSize: 18,
    color: "#333",
  },
});

export default Select;
