import React from "react";
import {
  Modal as RNModal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native-paper";

type ModalProps = {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  contentCardStyles?: any;
  children: React.ReactNode;
  closeButtonStyles?: object;
  iconColor?: string;
  onRequestClose?: () => void;
  overlayStyles?: object;
};

const Modal = ({
  visible,
  onClose,
  title,
  children,
  contentCardStyles,
  closeButtonStyles,
  overlayStyles,
  onRequestClose,
  iconColor = "#333",
}: ModalProps) => {
  return (
    <RNModal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}
      statusBarTranslucent
    >
      <View style={[styles.modalOverlay, overlayStyles]}>
        <View style={[styles.modalContainer, contentCardStyles]}>
          {/* Close Button at the top right */}
          {onClose && (
            <TouchableOpacity
              style={[styles.closeButton, closeButtonStyles]}
              onPress={onClose}
            >
              <Ionicons name="close" size={28} color={iconColor} />
            </TouchableOpacity>
          )}

          {/* Modal Title */}
          {title && <Text style={styles.modalTitle}>{title}</Text>}

          {/* Modal Content */}
          <View style={styles.modalContent}>{children}</View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent background
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 24,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1, // Make sure the close button stays on top
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  modalContent: {
    paddingBottom: 10,
  },
});

export default Modal;
