import { View, Text, TouchableOpacity, TextInput, ScrollView, SafeAreaView, Alert } from "react-native";
import React, { useState, memo, useRef } from "react";
import styled from "styled-components";
import * as colors from "../variables/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Button from "../components/Button";
import Feather from "@expo/vector-icons/Feather";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import { Dimensions } from "react-native";

const screenHeight = Dimensions.get("screen").height;

const BlockAddingOrder = styled.View`
  width: 100%;
  height: 100%;
`;
const BlockAddingOrderTitle = styled.Text`
  color: ${colors.titleText};
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
  align-self: center;
`;
const BlockAddingOrderName = styled.View`
  flex-direction: row;
  height: ${screenHeight < 760 ? "30px" : "40px"};
  align-items: center;
`;
const BlockAddingOrderNameText = styled.Text`
  color: ${colors.titleText};
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
  align-self: flex-start;
  align-self: center;
`;
const InputOrderName = styled.TextInput`
  width: 50%;
  height: 100%;
  background-color: ${colors.backgroundColorInput};
  border-radius: 5px;
  padding-left: 1%;
  padding-right: 1%;
  color: ${colors.creatingOrderText};
  margin-left: 2%;
  font-size: 15px;
`;
const BlockAddingOrderDate = styled.TouchableOpacity`
  color: ${colors.titleText};
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
  align-self: center;
`;
const BlockAddingOrderDateText = styled.Text`
  color: ${colors.titleText};
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
  align-self: center;
  margin-left: 2%;
`;
const BlockAddingOrderParticipants = styled.View`
  color: ${colors.titleText};
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
  flex-direction: row;
  width: 100%;
`;
const AddingOrderDate = styled.View`
  color: ${colors.titleText};
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
  flex-direction: row;
  width: 100%;
`;
const BlockAddingOrderAdd = styled.View`
  color: ${colors.titleText};
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
  flex-direction: row;
`;
const BlockAddingOrderAddText = styled.Text`
  color: ${colors.titleText};
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
  width: 67%;
`;
const BlockAddingOrderAddQ = styled.Text`
  color: ${colors.titleText};
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
`;
const BlockAddingOrderParticipantsText = styled.Text`
  color: ${colors.titleText};
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
`;
const BlockInput = styled.View`
  width: 100%;
  height: ${screenHeight < 760 ? "40px" : "50px"};
  padding-top: 1%;
  font-size: ${screenHeight < 760 ? "20px" : "25px"};
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
  bottom: 0;
  width: 100%;
`;

export default memo(function CreatingOrder({ participants, setCreateOrderModal, setParticipants }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [nameOfOrder, setNameForOrder] = useState("");
  const [dateForOrder, setDateForOrder] = useState(new Date());
  const [orders, setOrders] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const { t } = useTranslation();
  const nameRef = useRef();

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
    nameRef.current.focus();
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
        title: `You have got a new ORDER from ${arrOfParicipantsEmail[0]} with name ${nameOfOrder}`,
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
        nameOfOrder: nameOfOrder,
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
    if (!nameOfOrder) {
      return Alert.alert(`${t("CreatingOrderNameAlert")}`);
    }
    if (orders.length < 1) {
      return Alert.alert(`${t("CreatingOrderInputAlert")}`);
    }
    fetchOrders()
      .then(() => setParticipants([]))
      .then(() => setOrders([]))
      .then(() => setNameForOrder(""))
      .then(() => setCreateOrderModal(false));
  };

  return (
    <BlockAddingOrder>
      <BlockAddingOrderTitle>{t("CreatingOrderCreate")}</BlockAddingOrderTitle>
      <BlockAddingOrderName>
        <BlockAddingOrderNameText>{t("CreatingOrderName")}:</BlockAddingOrderNameText>
        <InputOrderName
          onChangeText={setNameForOrder}
          value={nameOfOrder}
          maxLength={14}
          placeholder={t("CreatingOrderNamePlaceholder")}
        ></InputOrderName>
      </BlockAddingOrderName>
      <BlockAddingOrderParticipants>
        <BlockAddingOrderParticipantsText>{t("CreatingOrderParticipants")}</BlockAddingOrderParticipantsText>
        {Boolean(participants) ? (
          <ScrollView
            horizontal
            style={{
              marginRight: "3%",
              width: "70%",
              overflow: "scroll",
              marginLeft: "2%",
            }}
          >
            {participants.map((e, index) => (
              <Text
                style={{ color: colors.titleText, fontSize: screenHeight < 760 ? 15 : 20 }}
                key={index}
                onPress={() => {
                  delFronArrayOfParticipants(e);
                }}
              >
                {e.nikname + " "}
              </Text>
            ))}
          </ScrollView>
        ) : null}
      </BlockAddingOrderParticipants>
      <AddingOrderDate>
        <BlockAddingOrderParticipantsText>{t("CreatingOrderDate")}</BlockAddingOrderParticipantsText>
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
      </AddingOrderDate>
      <BlockInput>
        <Input
          ref={nameRef}
          onChangeText={setName}
          value={name}
          maxLength={25}
          placeholder={t("CreatingOrderPlaceholderName")}
        ></Input>
        <BlockInputQnt
          onChangeText={setQuantity}
          value={quantity}
          maxLength={7}
          placeholder={t("CreatingOrderPlaceholderQT")}
        ></BlockInputQnt>
        <BlockInputBtn
          onPress={() => {
            addingToChart();
          }}
        >
          <MaterialIcons
            name="shopping-cart-checkout"
            size={screenHeight < 760 ? 20 : 30}
            color={colors.placeolderColor}
          />
        </BlockInputBtn>
      </BlockInput>
      <SafeAreaView style={{ height: "45%", marginBottom: "1%" }}>
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
                    <Feather name="delete" size={screenHeight < 760 ? 20 : 25} color={colors.titleText} />
                  </BlockDelOrderBtn>
                </BlockAddingOrderAdd>
              ))}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
      <BlockResultBtn>
        <TouchableOpacity
          onPress={() => setCreateOrderModal(false)}
          style={{ width: "25%", height: screenHeight < 760 ? 40 : 50 }}
        >
          <Button children={t("ProffileCancel")} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            makeOrder();
          }}
          style={{ width: "25%", height: screenHeight < 760 ? 40 : 50 }}
        >
          <Button children={t("CreatingOrderMakeOrder")} />
        </TouchableOpacity>
      </BlockResultBtn>
    </BlockAddingOrder>
  );
});
