import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Divider, Text } from "react-native-paper";

type Option = {
  label: string;
  value: string | number;
};

type SelectModalProps = {
  options: Option[];
  selectedValues?: Array<string | number>;
  onValueChange: (value: Array<string | number>) => void;
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

const MultiSelect = ({
  options,
  selectedValues = [],
  onValueChange,
  label,
  placeholder = "Select options",
  icon,
  modalTitle = "Select Options",
  iconColor = "#A5A1A1",
  style,
  labelStyle,
  inputStyle,
  selectedTextStyles,
  iconSize,
}: SelectModalProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelect = (value: string | number) => {
    let updatedSelectedValues = [...selectedValues];
    if (updatedSelectedValues.includes(value)) {
      // If the value is already selected, remove it
      updatedSelectedValues = updatedSelectedValues.filter(
        (item) => item !== value,
      );
    } else {
      // Otherwise, add the value to the selected list
      updatedSelectedValues.push(value);
    }
    onValueChange(updatedSelectedValues);
  };

  const selectedLabels =
    options
      .filter((option) => selectedValues.includes(option.value))
      .map((option) => option.label)
      .join(", ") || placeholder;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TouchableOpacity
        style={[styles.selectInput, inputStyle]}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={[styles.selectedText, selectedTextStyles]}>
          {selectedLabels}
        </Text>
        {icon || (
          <MaterialIcons name="add" size={iconSize || 24} color={iconColor} />
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
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={{ fontSize: 18, color: "#5F65E2" }}>Done</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <>
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text style={styles.optionText}>{item.label}</Text>
                    <Ionicons
                      name={
                        selectedValues.includes(item.value)
                          ? "checkbox"
                          : "square-outline"
                      }
                      size={24}
                      color={
                        selectedValues.includes(item.value)
                          ? Colors.mainButtonBackground
                          : "#A5A1A1"
                      }
                    />
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
  },
  selectedText: {
    fontSize: 16,
    color: "#201C1C",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    padding: 15,
    maxHeight: Dimensions.get("window").height * 0.5,
    minHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
    color: "#333",
  },
});

export default MultiSelect;
