import { View, Text, StyleSheet, Dimensions } from "react-native";
import { memo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as colors from "../variables/colors";

const screenHeight = Dimensions.get("screen").height;

export default memo(function Button({ children, style, textStyle }) {
  return (
    <LinearGradient
      colors={[
        colors.startColorForGradientButton,
        colors.endColorForGradientButton,
        colors.startColorForGradientButton,
        colors.endColorForGradientButton,
      ]}
      start={{ x: 0.0, y: 0.0 }}
      end={{ x: 1.0, y: 1.0 }}
      style={[styles.buttonContainer, style]}
    >
      <Text style={[styles.text, textStyle]}>{children}</Text>
    </LinearGradient>
  );
});
const styles = StyleSheet.create({
  buttonContainer: {
    height: "100%",
    width: "100%",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: screenHeight < 760 ? 14 : 17,
    textAlign: "center",
    color: colors.BlockButtonText,
    paddingHorizontal: 2,
  },
});
