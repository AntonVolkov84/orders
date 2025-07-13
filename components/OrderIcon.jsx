import { View, StyleSheet, Dimensions } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as colors from "../variables/colors";

const screenHeight = Dimensions.get("screen").height;

const styles = StyleSheet.create({
  blockOrder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.orderBackgroundColor,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default function OrderIcon() {
  return (
    <View style={styles.blockOrder}>
      <FontAwesome name="cart-plus" size={screenHeight < 760 ? 30 : 40} color={colors.orderChartColor} />
    </View>
  );
}
