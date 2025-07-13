import { View, Text, StyleSheet, Dimensions } from "react-native";
import { memo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as colors from "../variables/colors";

const screenHeight = Dimensions.get("screen").height;

export default memo(function Button({ children }) {
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
      style={{
        height: "100%",
        width: "100%",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={styles.BlockButtonText}>{children}</Text>
    </LinearGradient>
  );
});
const styles = StyleSheet.create({
  BlockButtonText: {
    fontSize: screenHeight < 760 ? 14 : 17,
    textAlign: "center",
    color: colors.BlockButtonText,
    paddingLeft: 2,
    paddingRight: 2,
  },
});
