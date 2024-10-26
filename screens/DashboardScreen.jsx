import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as colors from "../variables/colors";
import { StatusBar } from "expo-status-bar";
import Proffile from "../components/Proffile";
import OrderIcon from "../components/OrderIcon";
import CreatingOrder from "../components/CreatingOrder";
import AddingParticipant from "../components/AddingParticipant";

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
  padding-top: 3%;
  background-color: ${colors.blockOrderCreateBackgroundColor};
`;
const BlockAddingParticipant = styled.View`
  width: 100%;
  height: 180px;
  padding-left: 3%;
  padding-right: 3%;
`;
const BlockAddingOrder = styled.View`
  width: 100%;
  height: 90%;
  margin-bottom: 1%;
  padding-left: 3%;
  padding-right: 3%;
`;

export default function DashboardScreen({ navigation }) {
  const [createOrderModal, setCreateOrderModal] = useState(false);
  const [participants, setParticipants] = useState([]);

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
              <AddingParticipant participants={participants} setParticipants={setParticipants} />
            </BlockAddingParticipant>
            <BlockAddingOrder>
              <CreatingOrder participants={participants} setCreateOrderModal={setCreateOrderModal} />
            </BlockAddingOrder>
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
