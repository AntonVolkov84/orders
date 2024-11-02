import { View, Text, TouchableOpacity, TextInput, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as colors from "../variables/colors";
import { StatusBar } from "expo-status-bar";
import styled from "styled-components";
import { db, auth } from "../firebaseConfig";
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, where } from "firebase/firestore";
import { SwipeListView } from "react-native-swipe-list-view";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import Button from "../components/Button";

const Container = styled.View`
  width: 100%;
  height: 100%;
  padding: 1%;
`;
const OrderName = styled.Text`
  font-size: 30px;
  color: ${colors.titleText};
  justify-self: center;
  align-self: center;
  margin-bottom: 2%;
`;
const BlockOrderItem = styled.View`
  flex-direction: row;
  height: 110px;
  align-items: center;
  background-color: ${colors.orderScreenItemBackground};
  margin-bottom: 1%;
`;
const BlockOrderItemOk = styled.View`
  flex-direction: row;
  height: 110px;
  align-items: center;
  background-color: ${colors.orderScreenItemBackgroundOk};
  margin-bottom: 1%;
`;
const BlockOrderItemName = styled.Text`
  width: 80%;
  font-size: 30px;
  color: ${colors.orderScreenItemText};
  margin-left: 2%;
`;
const BlockOrderItemQuantity = styled.Text`
  font-size: 30px;
  color: ${colors.orderScreenItemText};
  margin-left: 2%;
`;
const BlockOrderItemNameOk = styled.Text`
  width: 80%;
  font-size: 30px;
  color: ${colors.orderScreenItemText};
  margin-left: 2%;
`;
const BlockOrderItemQuantityOk = styled.Text`
  font-size: 30px;
  color: ${colors.orderScreenItemText};
  margin-left: 2%;
`;
const BlockSafeAreaView = styled.View`
  width: 100%;
  height: 100%;
`;

const HidenOk = styled.TouchableOpacity`
  background-color: ${colors.orderScreenHiddenUpdate};
  width: 45%;
  aspect-ratio: 1;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
`;

const HidenUpdate = styled.TouchableOpacity`
  background-color: ${colors.orderScreenHiddenOk};
  width: 45%;
  aspect-ratio: 1;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
`;

const Hiden = styled.View`
  height: 100%;
  width: 30%;
  flex-direction: row;
  position: absolute;
  justify-content: space-around;
  align-items: center;
  right: 0;
`;
const ModalBlock = styled.View`
  width: 100%;
  height: 95%;
`;
const ModalBlockBtn = styled.View`
  width: 100%;
  height: 100px;
  flex-direction: row;
  justify-content: space-around;
`;
const ModalBlockInput = styled.View`
  width: 100%;
  height: 500px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;
const ModalButton = styled.TouchableOpacity`
  width: 25%;
  height: 80px;
`;
const InputFieldName = styled.TextInput`
  width: 70%;
  height: 100px;
  background-color: ${colors.orderScreenModalInputBackgroung};
  border-radius: 18px;
  padding-left: 2%;
  font-size: 30px;
`;
const InputFieldQuantity = styled.TextInput`
  width: 25%;
  height: 100px;
  background-color: ${colors.orderScreenModalInputBackgroung};
  margin-left: 5%;
  border-radius: 12px;
  padding-left: 2%;
  font-size: 30px;
`;

const BlockButton = styled.View`
  width: 100%;
  height: 80px;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 2%;
`;
const BlockButtonBtn = styled.TouchableOpacity`
  width: 33%;
  height: 100%;
`;

export default function OrderScreen({ route, navigation }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [orders, setOrders] = useState(null);
  const [dataItem, setDataItem] = useState(null);
  const { item } = route.params;
  const currentUserEmail = auth.currentUser.email;
  const documentId = item.docId;

  const updateOrder = async () => {
    const updatingOrder = {
      id: Date.parse(new Date()),
      made: false,
      madeBy: currentUserEmail,
      name: name,
      quantity: quantity,
    };
    const firebaseRef = doc(db, "orders", documentId);
    await updateDoc(firebaseRef, {
      order: arrayUnion(updatingOrder),
    });
    await updateDoc(firebaseRef, {
      order: arrayRemove(dataItem),
    });
    setModalUpdate(false);
  };

  const okOrder = async (item) => {
    const updatingOrder = {
      id: Date.parse(new Date()),
      made: true,
      madeBy: currentUserEmail,
      name: item.name,
      quantity: item.quantity,
    };
    const firebaseRef = doc(db, "orders", documentId);
    await updateDoc(firebaseRef, {
      order: arrayRemove(item),
    });
    await updateDoc(firebaseRef, {
      order: arrayUnion(updatingOrder),
    });
    setModalUpdate(false);
  };

  useEffect(() => {
    onSnapshot(doc(db, "orders", documentId), (snapshot) => {
      setOrders(snapshot.data());
      setOrdersLoaded(true);
    });
  }, []);

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
      <Container>
        <OrderName>
          {ordersLoaded
            ? new Date(new Date(orders.dateForOrder)).toLocaleDateString("ru-RU", {
                month: "long",
                day: "numeric",
              })
            : "loading..."}
        </OrderName>
        <BlockButton>
          <BlockButtonBtn
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Button children="Go back" />
          </BlockButtonBtn>
          <BlockButtonBtn
            onPress={() => {
              navigation.navigate("Messaging", { item });
            }}
          >
            <Button children="Messaging" />
          </BlockButtonBtn>
        </BlockButton>
        <BlockSafeAreaView>
          {modalUpdate ? (
            <ModalBlock>
              <ModalBlockInput>
                <InputFieldName onChangeText={setName} maxLength={25} value={name}></InputFieldName>
                <InputFieldQuantity
                  onChangeText={setQuantity}
                  value={quantity}
                  maxLength={7}
                  keyboardType="numeric"
                ></InputFieldQuantity>
              </ModalBlockInput>

              <ModalBlockBtn>
                <ModalButton onPress={() => setModalUpdate(false)}>
                  <Button children="Cancel" />
                </ModalButton>
                <ModalButton onPress={() => updateOrder()}>
                  <Button children="Update" />
                </ModalButton>
              </ModalBlockBtn>
            </ModalBlock>
          ) : (
            <View>
              <View style={{ marginBottom: " 5%" }}>
                {ordersLoaded ? (
                  <FlatList
                    data={orders.order.filter((e) => e.made === true)}
                    renderItem={({ item }) => (
                      <BlockOrderItemOk>
                        <BlockOrderItemNameOk>{item.name}</BlockOrderItemNameOk>
                        <BlockOrderItemQuantityOk>{item.quantity}</BlockOrderItemQuantityOk>
                      </BlockOrderItemOk>
                    )}
                    keyExtractor={(item, index) => index}
                  />
                ) : null}
              </View>
              {ordersLoaded ? (
                <>
                  <SwipeListView
                    style={{ width: "100%", height: "100%" }}
                    data={orders.order.filter((e) => e.made !== true)}
                    renderItem={(data, rowMap, index) => (
                      <BlockOrderItem key={index}>
                        <BlockOrderItemName>{data.item.name}</BlockOrderItemName>
                        <BlockOrderItemQuantity>{data.item.quantity}</BlockOrderItemQuantity>
                      </BlockOrderItem>
                    )}
                    renderHiddenItem={(data, rowMap) => (
                      <Hiden>
                        <HidenUpdate
                          onPress={() => {
                            setName(data.item.name);
                            setQuantity(data.item.quantity);
                            setDataItem(data.item);
                            setModalUpdate(true);
                          }}
                        >
                          <Ionicons color="white" size={40} name="create"></Ionicons>
                        </HidenUpdate>
                        <HidenOk
                          onPress={() => {
                            setDataItem(data.item);
                            okOrder(data.item);
                          }}
                        >
                          <Entypo name="check" size={40} color="white" />
                        </HidenOk>
                      </Hiden>
                    )}
                    rightOpenValue={-230}
                  ></SwipeListView>
                </>
              ) : null}
            </View>
          )}
        </BlockSafeAreaView>
      </Container>
    </LinearGradient>
  );
}
