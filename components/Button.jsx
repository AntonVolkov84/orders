import { View, Text } from "react-native";
import React from "react";
import styled from "styled-components";
import { LinearGradient } from "expo-linear-gradient";
import * as colors from "../variables/colors";

const BlockButtonText = styled.Text`
  font-size: 17px;
  text-align: center;
  color: ${colors.BlockButtonText};
  padding-left: 2px;
  padding-right: 2px;
`;

export default function Button({ children }) {
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
      style={{ height: "100%", width: "100%", borderRadius: 30, justifyContent: "center", alignItems: "center" }}
    >
      <BlockButtonText>{children}</BlockButtonText>
    </LinearGradient>
  );
}
