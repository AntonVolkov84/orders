import { View, Text } from "react-native";
import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import styled from "styled-components";
import * as colors from "../variables/colors";
import { Dimensions } from "react-native";

const screenHeight = Dimensions.get("screen").height;

const BlockOrder = styled.View`
  width: 100%;
  height: 100%;
  background-color: ${colors.orderBackgroundColor};
  justify-content: center;
  align-items: center;
`;

export default function OrderIcon() {
  return (
    <BlockOrder>
      <FontAwesome name="cart-plus" size={screenHeight < 760 ? 30 : 40} color={colors.orderChartColor} />
    </BlockOrder>
  );
}
