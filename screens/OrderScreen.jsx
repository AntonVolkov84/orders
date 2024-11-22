import { View, Text, TouchableOpacity, TextInput, FlatList, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as colors from "../variables/colors";
import { StatusBar } from "expo-status-bar";
import styled from "styled-components";
import { db, auth } from "../firebaseConfig";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  where,
  collection,
  query,
} from "firebase/firestore";
import { SwipeListView } from "react-native-swipe-list-view";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import Button from "../components/Button";

const Container = styled.View`
  width: 100%;
  height: 70%;
  padding: 1%;
  padding-top: 5%;
`;
const OrderName = styled.Text`
  font-size: 25px;
  color: ${colors.titleText};
  justify-self: center;
  align-self: center;
  margin-bottom: 2%;
`;
const BlockOrder = styled.View`
  height: 100%;
`;
const BlockOrderItemAll = styled.View`
  height: 100%;
  margin-bottom: 2%;
`;
const BlockOrderItem = styled.View`
  flex-direction: row;
  height: 70px;
  align-items: center;
  background-color: ${colors.orderScreenItemBackground};
  margin-bottom: 1%;
`;
const BlockOrderItemOk = styled.View`
  flex-direction: column;
  height: 70px;
  align-items: center;
  background-color: ${colors.orderScreenItemBackgroundOk};
  margin-bottom: 1%;
`;
const BlockOrderItemOkInfo = styled.View`
  flex-direction: row;
  height: 70%;
  align-items: center;
  background-color: ${colors.orderScreenItemBackgroundOk};
`;
const BlockOrderItemOkAuthor = styled.Text`
  text-align: center;
  width: 100%;
  height: 20%;
  background-color: ${colors.orderScreenItemBackgroundOk};
  font-size: 10px;
`;
const BlockOrderItemName = styled.Text`
  width: 70%;
  font-size: 20px;
  color: ${colors.orderScreenItemText};
  margin-left: 2%;
`;
const BlockOrderItemQuantity = styled.Text`
  font-size: 20px;
  color: ${colors.orderScreenItemText};
  margin-left: 1%;
  width: 26%;
`;
const BlockOrderItemNameOk = styled.Text`
  width: 70%;
  font-size: 20px;
  color: ${colors.orderScreenItemText};
  margin-left: 2%;
`;
const BlockOrderItemQuantityOk = styled.Text`
  font-size: 20px;
  color: ${colors.orderScreenItemText};
  margin-left: 1%;
  width: 26%;
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
  height: 70px;
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
  height: 70px;
  flex-direction: row;
  justify-content: space-around;
`;
const ModalBlockInput = styled.View`
  width: 100%;
  height: 300px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;
const ModalButton = styled.TouchableOpacity`
  width: 25%;
  height: 70px;
`;
const InputFieldName = styled.TextInput`
  width: 70%;
  height: 70px;
  background-color: ${colors.orderScreenModalInputBackgroung};
  border-radius: 18px;
  padding-left: 2%;
  font-size: 20px;
`;
const InputFieldQuantity = styled.TextInput`
  width: 25%;
  height: 70px;
  background-color: ${colors.orderScreenModalInputBackgroung};
  margin-left: 5%;
  border-radius: 12px;
  font-size: 20px;
  text-align: center;
`;

const BlockButton = styled.View`
  width: 100%;
  height: 80px;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 2%;
`;
const NewMessageAlert = styled.View`
  position: absolute;
  right: 15px;
  top: -10px;
  width: 20px;
  height: 20px;
  justify-content: center;
  align-items: center;
  z-index: 2;
`;
const BlockButtonToggle = styled.View`
  width: 90%;
  height: 80px;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 2%;
  padding: 0 2px;
`;
const BlockButtonBtn = styled.TouchableOpacity`
  width: 30%;
  height: 50px;
`;
const BlockButtonBtnBack = styled.TouchableOpacity`
  width: 13%;
  height: 50px;
`;

export default function OrderScreen({ route, navigation }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [orders, setOrders] = useState(null);
  const [dataItem, setDataItem] = useState(null);
  const [toggleBoughtItems, setToggleBoughtItems] = useState(false);
  const [newMessageArrived, setNewMessageArrived] = useState(false);
  const { item } = route.params;
  const currentUserEmail = auth.currentUser.email;
  const documentId = item.docId;

  const checkUnreadMessages = async () => {
    const refForChangeMessageStatus = query(
      collection(db, "messages", documentId, "conversation"),
      where("doNotReadBy", "array-contains", currentUserEmail)
    );
    const unreadMessages = await getDocs(refForChangeMessageStatus);
    unreadMessages.forEach(async (document) => {
      setNewMessageArrived(true);
    });
  };

  const updateOrder = async () => {
    if (!name || !quantity) {
      Alert.alert("Some field is empty");
    }
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
    if (dataItem) {
      await updateDoc(firebaseRef, {
        order: arrayRemove(dataItem),
      });
    }
    setModalUpdate(false);
    setName("");
    setQuantity("");
    setDataItem("");
  };

  const okOrder = async (item) => {
    const updatingOrder = {
      id: Date.parse(new Date()),
      made: true,
      madeBy: currentUserEmail,
      madeByDisplayName: auth.currentUser.displayName || currentUserEmail,
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
    setNewMessageArrived(false);
    onSnapshot(doc(db, "orders", documentId), (snapshot) => {
      setOrders(snapshot.data());
      setOrdersLoaded(true);
    });
    checkUnreadMessages();
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
          <BlockButtonBtnBack
            onPress={() => {
              navigation.goBack();
            }}
          >
            <LinearGradient
              colors={[
                colors.startColorForGradientButton,
                colors.endColorForGradientButton,
                colors.startColorForGradientButton,
                colors.endColorForGradientButton,
              ]}
              start={{ x: 0.0, y: 0.0 }}
              end={{ x: 1.0, y: 1.0 }}
              style={{
                height: "100%",
                width: "100%",
                borderRadius: 30,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="arrow-back-circle-outline" size={40} color={colors.BlockButtonText} />
            </LinearGradient>
          </BlockButtonBtnBack>
          <BlockButtonBtn
            onPress={() => {
              setModalUpdate(true);
            }}
          >
            <Button children="Add one more" />
          </BlockButtonBtn>
          <BlockButtonBtn
            onPress={() => {
              setNewMessageArrived(false);
              navigation.navigate("Messaging", { item });
            }}
          >
            {newMessageArrived ? (
              <NewMessageAlert>
                <Ionicons name="alert-circle-sharp" size={20} color={colors.NewMessageArrivedColor} />
              </NewMessageAlert>
            ) : null}

            <Button children="Messaging" />
          </BlockButtonBtn>
        </BlockButton>
        <BlockSafeAreaView>
          {modalUpdate ? (
            <ModalBlock>
              <ModalBlockInput>
                <InputFieldName
                  onChangeText={setName}
                  maxLength={25}
                  value={name}
                  placeholder="Name of product or business"
                ></InputFieldName>
                <InputFieldQuantity
                  onChangeText={setQuantity}
                  value={quantity}
                  maxLength={7}
                  placeholder="Quantity"
                ></InputFieldQuantity>
              </ModalBlockInput>
              <ModalBlockBtn>
                <ModalButton
                  onPress={() => {
                    setModalUpdate(false);
                    setName("");
                    setQuantity("");
                    setDataItem("");
                  }}
                >
                  <Button children="Cancel" />
                </ModalButton>
                <ModalButton onPress={() => updateOrder()}>
                  <Button children="Update" />
                </ModalButton>
              </ModalBlockBtn>
            </ModalBlock>
          ) : (
            <BlockOrder>
              {toggleBoughtItems ? (
                <>
                  {ordersLoaded ? (
                    <FlatList
                      data={orders.order.filter((e) => e.made === true)}
                      renderItem={({ item }) => (
                        <BlockOrderItemOk>
                          <BlockOrderItemOkInfo>
                            <BlockOrderItemNameOk>{item.name}</BlockOrderItemNameOk>
                            <BlockOrderItemQuantityOk>{item.quantity}</BlockOrderItemQuantityOk>
                          </BlockOrderItemOkInfo>
                          <BlockOrderItemOkAuthor>{item.madeByDisplayName}</BlockOrderItemOkAuthor>
                        </BlockOrderItemOk>
                      )}
                      keyExtractor={(item, index) => index}
                    />
                  ) : null}
                </>
              ) : (
                <>
                  {ordersLoaded ? (
                    <BlockOrderItemAll>
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
                              <Ionicons color="white" size={30} name="create"></Ionicons>
                            </HidenUpdate>
                            <HidenOk
                              onPress={() => {
                                setDataItem(data.item);
                                okOrder(data.item);
                              }}
                            >
                              <Entypo name="check" size={30} color="white" />
                            </HidenOk>
                          </Hiden>
                        )}
                        rightOpenValue={-130}
                      ></SwipeListView>
                    </BlockOrderItemAll>
                  ) : null}
                </>
              )}
            </BlockOrder>
          )}
        </BlockSafeAreaView>
        <BlockButtonToggle>
          <BlockButtonBtn
            onPress={() => {
              setToggleBoughtItems(!toggleBoughtItems);
            }}
          >
            <Button children={toggleBoughtItems ? "Order items" : "Bought items"} />
          </BlockButtonBtn>
        </BlockButtonToggle>
      </Container>
    </LinearGradient>
  );
}
