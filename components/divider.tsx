import React from "react";
import { StyleSheet, Text, View } from "react-native";

type DividerProps = {
  orientation?: "horizontal" | "vertical";
  text?: string;
  style?: object;
  color?: string;
  thickness?: number;
};

const Divider = ({
  orientation = "horizontal",
  text = "",
  style,
  color = "#ccc",
  thickness = 1,
}: DividerProps) => {
  return (
    <View
      style={[
        styles.container,
        orientation === "vertical"
          ? styles.verticalContainer
          : styles.horizontalContainer,
        style,
      ]}
    >
      {orientation === "horizontal" && (
        <>
          <View
            style={[styles.line, { backgroundColor: color, height: thickness }]}
          />
          {text ? <Text style={styles.text}>{text}</Text> : null}
          <View
            style={[styles.line, { backgroundColor: color, height: thickness }]}
          />
        </>
      )}

      {orientation === "vertical" && (
        <View
          style={[
            styles.lineVertical,
            { backgroundColor: color, width: thickness },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  horizontalContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  verticalContainer: {
    height: "100%",
    justifyContent: "center",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  lineVertical: {
    height: "100%",
    backgroundColor: "#ccc",
  },
  text: {
    marginHorizontal: 10,
    fontSize: 16,
    color: "#666",
  },
});

export default Divider;
