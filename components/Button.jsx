import { View, Text } from "react-native";
import React from "react";
import styled from "styled-components";
import { LinearGradient } from "expo-linear-gradient";
import * as colors from "../variables/colors";

const BlockButton = styled.View`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`;
const BlockButtonText = styled.Text`
  font-size: 25px;
  color: ${colors.BlockButtonText};
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
