import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as colors from "../variables/colors";
import { StatusBar } from "expo-status-bar";
import Proffile from "../components/Proffile";
import OrderIcon from "../components/OrderIcon";
import CreatingOrder from "../components/CreatingOrder";
import AddingParticipant from "../components/AddingParticipant";
import Button from "../components/Button";
import styled from "styled-components";

const BlockOrderIcon = styled.TouchableOpacity`
  width: 20%;
  aspect-ratio: 1;
  border-radius: 100px;
  overflow: hidden;
  position: absolute;
  bottom: 8%;
  right: 8%;
`;
const BlockOrderCreate = styled.View`
  width: 100%;
  height: 100%;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding-top: 5%;
  background-color: ${colors.blockOrderCreateBackgroundColor};
`;
const BlockAddingParticipant = styled.View`
  width: 100%;
  height: 15%;
  padding-left: 3%;
  padding-right: 3%;
  margin-bottom: 1%;
`;
const BlockAddingOrder = styled.View`
  width: 100%;
  height: 70%;
  margin-bottom: 1%;
`;

export default function DashboardScreen({ navigation }) {
  const [createOrderModal, setCreateOrderModal] = useState(false);
  return (
    <LinearGradient
      colors={[
        colors.startColorForGradient,
        colors.endColorForGradient,
        colors.startColorForGradient,
        colors.endColorForGradient,
      ]}
      start={{ x: 0.0, y: 0.0 }}
      end={{ x: 1.0, y: 1.0 }}
      style={{ height: "100%", width: "100%", paddingTop: "5%" }}
    >
      <StatusBar style="light" />
      {createOrderModal ? (
        <>
          <BlockOrderCreate>
            <BlockAddingParticipant>
              <AddingParticipant />
            </BlockAddingParticipant>
            <BlockAddingOrder>
              <CreatingOrder />
            </BlockAddingOrder>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
              <TouchableOpacity onPress={() => setCreateOrderModal(false)} style={{ width: "25%", height: 80 }}>
                <Button children="Cansel" />
              </TouchableOpacity>
              <View style={{ width: "25%", height: 80 }}>
                <Button children="Make order" />
              </View>
            </View>
          </BlockOrderCreate>
        </>
      ) : (
        <>
          <Proffile />
          <BlockOrderIcon onPress={() => setCreateOrderModal(true)}>
            <OrderIcon />
          </BlockOrderIcon>
        </>
      )}
    </LinearGradient>
  );
}
