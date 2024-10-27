import { View, Text, TouchableOpacity, TextInput, ScrollView, SafeAreaView } from "react-native";
import React, { useState } from "react";
import styled from "styled-components";
import * as colors from "../variables/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Button from "../components/Button";
import Feather from "@expo/vector-icons/Feather";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

const BlockAddingOrder = styled.View`
  width: 100%;
  height: 100%;
`;
const BlockAddingOrderTitle = styled.Text`
  color: ${colors.titleText};
  font-size: 35px;
  align-self: center;
`;
const BlockAddingOrderDate = styled.TouchableOpacity`
  color: ${colors.titleText};
  font-size: 35px;
  align-self: center;
`;
const BlockAddingOrderDateText = styled.Text`
  color: ${colors.titleText};
  font-size: 35px;
  align-self: center;
  margin-left: 2%;
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
  font-size: 25px;
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
  font-size: 30px;
`;
const BlockInputQnt = styled.TextInput`
  width: 20%;
  height: 100%;
  background-color: ${colors.backgroundColorInput};
  border-radius: 5px;
  margin-left: 1%;
  color: ${colors.creatingOrderText};
  font-size: 30px;
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
const BlockDelOrderBtn = styled.TouchableOpacity`
  width: 12%;
  position: absolute;
  right: 0;
  justify-content: center;
  align-items: center;
`;
const BlockResultBtn = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  position: absolute;
  top: 800px;
  width: 100%;
`;

export default function CreatingOrder({ participants, setCreateOrderModal, setParticipants }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [dateForOrder, setDateForOrder] = useState(new Date());
  const [orders, setOrders] = useState([]);

  const delFronArrayOfParticipants = (participant) => {
    const newArray = participants.filter((e) => e.email !== participant.email);
    setParticipants(newArray);
  };

  const addingToChart = () => {
    setOrders((prevOrders) => [...prevOrders, { name, quantity, id: Date.parse(new Date()) }]);
    setName("");
    setQuantity("");
  };
  const delFromChart = (id) => {
    const newOrders = orders.filter((order) => order.id !== id);
    setOrders(newOrders);
  };
  const fetchOrders = async () => {
    const currentEmail = auth.currentUser.email;
    const arrOfParicipantsEmail = [currentEmail];
    participants.map((e) => arrOfParicipantsEmail.push(e.email));
    try {
      const order = {
        timestamp: serverTimestamp(),
        participants: arrOfParicipantsEmail,
        order: [...orders],
        orderId: Date.parse(new Date()),
      };
      await addDoc(collection(db, "orders", currentEmail, "personal orders"), order);
    } catch (error) {
      console.log("add to users", error);
    }
  };

  const makeOrder = async () => {
    fetchOrders()
      .then(() => setParticipants([]))
      .then(() => setOrders([]))
      .then(() => setCreateOrderModal(false));
  };

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
            {participants.map((e) => (
              <Text
                key={e.userId}
                onPress={() => {
                  delFronArrayOfParticipants(e);
                }}
              >
                {e.nikname + " "}
              </Text>
            ))}
          </Text>
        ) : null}
      </BlockAddingOrderParticipants>
      <BlockAddingOrderParticipants>
        <BlockAddingOrderParticipantsText>Order date:</BlockAddingOrderParticipantsText>
        <BlockAddingOrderDate
          onPress={() => {
            console.log(dateForOrder);
          }}
        >
          <BlockAddingOrderDateText>{new Date(dateForOrder).toLocaleDateString("en-GB")}</BlockAddingOrderDateText>
        </BlockAddingOrderDate>
      </BlockAddingOrderParticipants>
      <SafeAreaView>
        <ScrollView style={{ height: 450 }}>
          {Boolean(orders.length) ? (
            <>
              {orders.map((order, index) => (
                <BlockAddingOrderParticipants key={index}>
                  <BlockAddingOrderParticipantsText>{order.name}</BlockAddingOrderParticipantsText>
                  <BlockAddingOrderDateText>{order.quantity}</BlockAddingOrderDateText>
                  <BlockDelOrderBtn
                    onPress={() => {
                      delFromChart(order.id);
                    }}
                  >
                    <Feather name="delete" size={35} color={colors.titleText} />
                  </BlockDelOrderBtn>
                </BlockAddingOrderParticipants>
              ))}
            </>
          ) : null}
          <BlockInput>
            <Input onChangeText={setName} value={name} maxLength={25} placeholder="Name of product or business"></Input>
            <BlockInputQnt
              onChangeText={setQuantity}
              value={quantity}
              maxLength={7}
              keyboardType="numeric"
              placeholder="Quantity"
            ></BlockInputQnt>
            <BlockInputBtn
              onPress={() => {
                addingToChart();
              }}
            >
              <MaterialIcons name="shopping-cart-checkout" size={45} color={colors.creatingOrderIcon} />
            </BlockInputBtn>
          </BlockInput>
        </ScrollView>
      </SafeAreaView>
      <BlockResultBtn>
        <TouchableOpacity onPress={() => setCreateOrderModal(false)} style={{ width: "25%", height: 80 }}>
          <Button children="Cansel" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            makeOrder();
          }}
          style={{ width: "25%", height: 80 }}
        >
          <Button children="Make order" />
        </TouchableOpacity>
      </BlockResultBtn>
    </BlockAddingOrder>
  );
}
