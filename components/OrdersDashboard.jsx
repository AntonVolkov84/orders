import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import * as colors from "../variables/colors";
import styled from "styled-components";
import { db } from "../firebaseConfig";
import { getDoc, doc, deleteDoc, addDoc, collection } from "firebase/firestore";
import Button from "./Button";

const BlockOrderShow = styled.TouchableOpacity`
  width: 100%;
  background-color: ${colors.blockMenuProfile};
  height: 250px;
  margin-top: 1%;
`;
const BlockOrder = styled.View`
  width: 100%;
  height: 100%;
  flex-direction: row;
`;
const BlockOrderCreator = styled.View`
  width: 25%;
  height: 100%;
  justify-content: center;
  align-items: center;
  margin-left: 1%;
  margin-right: 1%;
`;
const BlockOrderInfo = styled.View`
  width: 73%;
  height: 100%;
  margin-right: 1%;
  flex-direction: column;
`;
const BlockOrderInfoDate = styled.Text`
  width: 100%;
  height: 15%;
  font-size: 30px;
  text-align: center;
  margin: 3%;
`;
const BlockOrderInfoArr = styled.Text`
  width: 99%;
  height: 60%;
  margin-right: 1%;
  font-size: 30px;
  text-align: center;
`;
const BlockOrderCreatorAvatar = styled.Image`
  width: 90%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 150px;
`;
const BlockOrderCreatorName = styled.Text`
  font-size: 30px;
`;

const CloseOrderBtn = styled.TouchableOpacity`
  height: 70px;
  width: 30%;
  position: absolute;
  bottom: 8%;
  right: 3%;
`;

export default function OrdersDashboard({ item, navigation }) {
  const [orderCreatorProfile, setOrderCreatorProfile] = useState(null);
  const [loadingOrderCreatorProfile, setLoadingOrderCreatorProfile] = useState(false);
  const dateForOrder = new Date(item.dateForOrder);

  useEffect(() => {
    getOrderCreatorProfile();
  }, []);

  const getOrderCreatorProfile = async () => {
    const email = item.participants[0];
    const docRef = doc(db, "users", email);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setOrderCreatorProfile(docSnap.data());
      setLoadingOrderCreatorProfile(true);
    } else {
      console.log("Couldn`t download user profile");
    }
  };

  const delCompliteOrder = async (docId) => {
    const docRef = doc(db, "orders", docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const validationCloseAllPosition = data.order.some((e) => e.made !== true);
      if (!validationCloseAllPosition) {
        await addDoc(collection(db, "closed orders", orderCreatorProfile.email, "personal closed orders"), data);
        await deleteDoc(doc(db, "orders", docId));
        Alert.alert("Order complete and close!");
      } else {
        return Alert.alert("Some position is not close!");
      }
    }
  };

  return (
    <BlockOrderShow
      onPress={() => {
        navigation.navigate("OrderScreen", { item });
      }}
    >
      {loadingOrderCreatorProfile ? (
        <BlockOrder>
          <BlockOrderCreator>
            <BlockOrderCreatorAvatar
              source={{
                uri: orderCreatorProfile.photoURL,
              }}
            ></BlockOrderCreatorAvatar>
            <BlockOrderCreatorName>{orderCreatorProfile.nikname}</BlockOrderCreatorName>
          </BlockOrderCreator>
          <BlockOrderInfo>
            <BlockOrderInfoDate>
              {new Date(dateForOrder).toLocaleDateString("ru-RU", { month: "long", day: "numeric" })}
            </BlockOrderInfoDate>
            <BlockOrderInfoArr>{item.order.map((e) => e.name + " ")}</BlockOrderInfoArr>
            <CloseOrderBtn onPress={() => delCompliteOrder(item.docId)}>
              <Button children="Close order" />
            </CloseOrderBtn>
          </BlockOrderInfo>
        </BlockOrder>
      ) : null}
    </BlockOrderShow>
  );
}
