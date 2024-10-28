import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useState, useEffect } from "react";
import * as colors from "../variables/colors";
import styled from "styled-components";
import { db } from "../firebaseConfig";
import { getDoc, doc } from "firebase/firestore";

const BlockOrderShow = styled.TouchableOpacity`
  width: 98%;
  margin-left: 1%;
  background-color: ${colors.blockMenuProfile};
  height: 20%;
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
  height: 25%;
  font-size: 30px;
  text-align: center;
  margin: 3%;
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

export default function OrdersDashboard({ fetchedOrders }) {
  const [orderCreatorProfile, setOrderCreatorProfile] = useState(null);
  const [loadingOrderCreatorProfile, setLoadingOrderCreatorProfile] = useState(false);

  useEffect(() => {
    getOrderCreatorProfile();
  }, []);

  const getOrderCreatorProfile = async () => {
    const email = fetchedOrders[0].participants[0];
    const docRef = doc(db, "users", email);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setOrderCreatorProfile(docSnap.data());
      setLoadingOrderCreatorProfile(true);
    } else {
      console.log("Couldn`t download user profile");
    }
  };
  const dateForOrder = new Date(fetchedOrders[0].dateForOrder.seconds);

  return (
    <BlockOrderShow>
      {loadingOrderCreatorProfile ? (
        <BlockOrder>
          <BlockOrderCreator>
            <BlockOrderCreatorAvatar source={{ uri: orderCreatorProfile.photoURL }}></BlockOrderCreatorAvatar>
            <BlockOrderCreatorName>{orderCreatorProfile.nikname}</BlockOrderCreatorName>
          </BlockOrderCreator>
          <BlockOrderInfo>
            <BlockOrderInfoDate>
              {new Date(dateForOrder).toLocaleDateString("ru-RU", { month: "long", day: "numeric" })}
            </BlockOrderInfoDate>
          </BlockOrderInfo>
        </BlockOrder>
      ) : null}
    </BlockOrderShow>
  );
}
