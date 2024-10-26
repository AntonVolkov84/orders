import { View, Text, TouchableOpacity, TextInput, ScrollView, SafeAreaView } from "react-native";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import * as colors from "../variables/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Button from "../components/Button";
import { AppContext } from "../App";

const BlockAddingOrder = styled.View`
  width: 100%;
  height: 100%;
`;
const BlockAddingOrderTitle = styled.Text`
  color: ${colors.titleText};
  font-size: 35px;
  align-self: center;
`;
const BlockAddingOrderParticipants = styled.View`
  color: ${colors.titleText};
  font-size: 35px;
  flex-direction: row;
`;
const BlockAddingOrderParticipantsText = styled.Text`
  color: ${colors.titleText};
  font-size: 35px;
`;
const BlockInput = styled.View`
  width: 100%;
  height: 80px;
  padding-top: 1%;
  flex-direction: row;
`;
const Input = styled.TextInput`
  width: 65%;
  height: 100%;
  background-color: ${colors.backgroundColorInput};
  border-radius: 5px;
  padding-left: 1%;
  padding-right: 1%;
  color: ${colors.creatingOrderText};
  font-size: 25px;
`;
const BlockInputQnt = styled.TextInput`
  width: 20%;
  height: 100%;
  background-color: ${colors.backgroundColorInput};
  border-radius: 5px;
  margin-left: 1%;
  color: ${colors.creatingOrderText};
  font-size: 25px;
  text-align: center;
`;
const BlockInputBtn = styled.TouchableOpacity`
  width: 12%;
  height: 100%;
  background-color: ${colors.backgroundColorInput};
  border-radius: 5px;
  margin-left: 1%;
  justify-content: center;
  align-items: center;
`;
const BlockResultBtn = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  position: absolute;
  bottom: 10%;
  width: 100%;
`;

export default function CreatingOrder({ participants, setCreateOrderModal }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const orders = [];

  return (
    <BlockAddingOrder>
      <BlockAddingOrderTitle>Creating Order</BlockAddingOrderTitle>
      <BlockAddingOrderParticipants>
        <BlockAddingOrderParticipantsText>Participants:</BlockAddingOrderParticipantsText>
        {Boolean(participants) ? (
          <Text
            style={{
              marginRight: "3%",
              width: "70%",
              overflow: "wrap",
              marginLeft: "2%",
              color: colors.titleText,
              fontSize: 35,
            }}
          >
            {participants.map((e) => e.nikname + " ")}
          </Text>
        ) : null}
      </BlockAddingOrderParticipants>
      <SafeAreaView>
        <ScrollView>
          <BlockInput>
            <Input onChangeText={setName} maxLength={30} placeholder="Name of product or business"></Input>
            <BlockInputQnt onChangeText={setQuantity} maxLength={7} placeholder="Quantity"></BlockInputQnt>
            <BlockInputBtn>
              <MaterialIcons name="shopping-cart-checkout" size={45} color={colors.creatingOrderIcon} />
            </BlockInputBtn>
          </BlockInput>
        </ScrollView>
      </SafeAreaView>
      <BlockResultBtn>
        <TouchableOpacity onPress={() => setCreateOrderModal(false)} style={{ width: "25%", height: 80 }}>
          <Button children="Cansel" />
        </TouchableOpacity>
        <View style={{ width: "25%", height: 80 }}>
          <Button children="Make order" />
        </View>
      </BlockResultBtn>
    </BlockAddingOrder>
  );
}
