import { View, Text, TouchableOpacity, TextInput, ScrollView, SafeAreaView, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import * as colors from "../variables/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Button from "../components/Button";
import Feather from "@expo/vector-icons/Feather";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import DateTimePicker from "@react-native-community/datetimepicker";

const BlockAddingOrder = styled.View`
  width: 100%;
  height: 100%;
`;
const BlockAddingOrderTitle = styled.Text`
  color: ${colors.titleText};
  font-size: 20px;
  align-self: center;
`;
const BlockAddingOrderDate = styled.TouchableOpacity`
  color: ${colors.titleText};
  font-size: 20px;
  align-self: center;
`;
const BlockAddingOrderDateText = styled.Text`
  color: ${colors.titleText};
  font-size: 20px;
  align-self: center;
  margin-left: 2%;
`;
const BlockAddingOrderParticipants = styled.View`
  color: ${colors.titleText};
  font-size: 20px;
  flex-direction: row;
`;
const BlockAddingOrderAdd = styled.View`
  color: ${colors.titleText};
  font-size: 20px;
  flex-direction: row;
`;
const BlockAddingOrderAddText = styled.Text`
  color: ${colors.titleText};
  font-size: 20px;
  width: 67%;
`;
const BlockAddingOrderAddQ = styled.Text`
  color: ${colors.titleText};
  font-size: 20px;
`;
const BlockAddingOrderParticipantsText = styled.Text`
  color: ${colors.titleText};
  font-size: 20px;
`;
const BlockInput = styled.View`
  width: 100%;
  height: 50px;
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
  font-size: 15px;
`;
const BlockInputQnt = styled.TextInput`
  width: 20%;
  height: 100%;
  background-color: ${colors.backgroundColorInput};
  border-radius: 5px;
  margin-left: 1%;
  color: ${colors.creatingOrderText};
  font-size: 15px;
  padding-left: 1%;
`;
const BlockInputBtn = styled.TouchableOpacity`
  width: 13%;
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
  position: sticky;
  bottom: 0px;
  width: 100%;
`;

export default function CreatingOrder({ participants, setCreateOrderModal, setParticipants, sendPushNotification }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [dateForOrder, setDateForOrder] = useState(new Date());
  const [orders, setOrders] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  const handleChangeDate = (event) => {
    setShowPicker(false);
    setDateForOrder(new Date(event.nativeEvent.timestamp));
  };

  const delFronArrayOfParticipants = (participant) => {
    const newArray = participants.filter((e) => e.email !== participant.email);
    setParticipants(newArray);
  };

  const addingToChart = () => {
    if (!Boolean(name) || Boolean(!quantity)) {
      return Alert.alert("Some input field is empty!");
    }
    setOrders((prevOrders) => [...prevOrders, { name, quantity, id: Date.parse(new Date()), made: false, madeBy: "" }]);
    setName("");
    setQuantity("");
  };
  const delFromChart = (id) => {
    const newOrders = orders.filter((order) => order.id !== id);
    setOrders(newOrders);
  };

  const sendNotificationWhithNewOrders = async (arrOfParicipantsEmail, orders) => {
    const arrOfReseiver = [];
    if (arrOfParicipantsEmail.length < 2) {
      return;
    }
    for (let i = 1; i < arrOfParicipantsEmail.length; i++) {
      const docSnap = await getDoc(doc(db, "users", arrOfParicipantsEmail[i]));
      arrOfReseiver.push(docSnap.data().pushToken);
    }
    try {
      const message = {
        to: arrOfReseiver,
        sound: "default",
        title: `You have got a new ORDER from ${arrOfParicipantsEmail[0]}`,
        body: "Do not forget to complete me!!!",
        data: { someData: orders },
      };

      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          host: "exp.host",
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.log(error);
    }
  };
  const fetchOrders = async () => {
    const currentEmail = auth.currentUser.email;
    const arrOfParicipantsEmail = [currentEmail];
    participants.map((e) => arrOfParicipantsEmail.push(e.email));
    sendNotificationWhithNewOrders(arrOfParicipantsEmail, orders);
    try {
      const order = {
        timestamp: serverTimestamp(),
        dateForOrder: Date.parse(dateForOrder),
        participants: arrOfParicipantsEmail,
        order: [...orders],
        orderId: Date.parse(new Date()),
      };
      await addDoc(collection(db, "orders"), order);
    } catch (error) {
      console.log("add to users", error);
    }
  };

  const makeOrder = async () => {
    if (orders.length < 1) {
      return Alert.alert("You can`t make order. There is no one position!");
    }
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
              fontSize: 20,
            }}
          >
            {participants.map((e, index) => (
              <Text
                key={index}
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
        {showPicker && (
          <DateTimePicker
            style={{ width: "80%", aspectRatio: 3 / 4 }}
            mode={"date"}
            value={new Date()}
            onChange={handleChangeDate}
          />
        )}
        <BlockAddingOrderDate
          onPress={() => {
            setShowPicker(true);
          }}
        >
          <BlockAddingOrderDateText>{new Date(dateForOrder).toLocaleDateString("en-GB")}</BlockAddingOrderDateText>
        </BlockAddingOrderDate>
      </BlockAddingOrderParticipants>
      <BlockInput>
        <Input onChangeText={setName} value={name} maxLength={25} placeholder="Name of product or business"></Input>
        <BlockInputQnt onChangeText={setQuantity} value={quantity} maxLength={7} placeholder="Quantity"></BlockInputQnt>
        <BlockInputBtn
          onPress={() => {
            addingToChart();
          }}
        >
          <MaterialIcons name="shopping-cart-checkout" size={30} color={colors.placeolderColor} />
        </BlockInputBtn>
      </BlockInput>
      <SafeAreaView style={{ height: "55%", marginBottom: "1%" }}>
        <ScrollView>
          {Boolean(orders.length) ? (
            <>
              {orders.map((order, index) => (
                <BlockAddingOrderAdd key={index}>
                  <BlockAddingOrderAddText>{order.name}</BlockAddingOrderAddText>
                  <BlockAddingOrderAddQ>{order.quantity}</BlockAddingOrderAddQ>
                  <BlockDelOrderBtn
                    onPress={() => {
                      delFromChart(order.id);
                    }}
                  >
                    <Feather name="delete" size={25} color={colors.titleText} />
                  </BlockDelOrderBtn>
                </BlockAddingOrderAdd>
              ))}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
      <BlockResultBtn>
        <TouchableOpacity onPress={() => setCreateOrderModal(false)} style={{ width: "25%", height: 50 }}>
          <Button children="Cancel" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            makeOrder();
          }}
          style={{ width: "25%", height: 50 }}
        >
          <Button children="Make order" />
        </TouchableOpacity>
      </BlockResultBtn>
    </BlockAddingOrder>
  );
}
