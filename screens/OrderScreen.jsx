import { View, Text, TouchableOpacity, TextInput, FlatList, Alert, ScrollView } from "react-native";
import React, { useState, useEffect, memo } from "react";
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
  getDoc,
  where,
  collection,
  query,
} from "firebase/firestore";
import { SwipeListView } from "react-native-swipe-list-view";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import Button from "../components/Button";
import { useTranslation } from "react-i18next";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { Dimensions } from "react-native";
import AddingParticipant from "../components/AddingParticipant";

const screenHeight = Dimensions.get("screen").height;

const Container = styled.View`
  width: 100%;
  height: 70%;
  padding: 1%;
  padding-top: 5%;
`;
const OrderName = styled.Text`
  font-size: ${screenHeight < 760 ? "20px" : "25px"};
  color: ${colors.titleText};
  justify-self: center;
  align-self: center;
  margin-bottom: 2%;
`;
const BlockOrder = styled.View`
  height: 99%;
`;
const BlockOrderItemAll = styled.View`
  height: 100%;
  margin-bottom: 2%;
`;
const BlockOrderItem = styled.View`
  flex-direction: row;
  height: ${screenHeight < 760 ? "50px" : "70px"};
  align-items: center;
  background-color: ${colors.orderScreenItemBackground};
  margin-bottom: 1%;
`;
const BlockOrderItemOk = styled.View`
  flex-direction: column;
  height: ${screenHeight < 760 ? "50px" : "70px"};
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
  font-size: ${screenHeight < 760 ? "8px" : "10px"};
`;
const BlockOrderItemName = styled.Text`
  width: 70%;
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
  color: ${colors.orderScreenItemText};
  margin-left: 2%;
`;
const BlockOrderItemQuantity = styled.Text`
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
  color: ${colors.orderScreenItemText};
  margin-left: 1%;
  width: 26%;
`;
const BlockOrderItemNameOk = styled.Text`
  width: 70%;
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
  color: ${colors.orderScreenItemText};
  margin-left: 2%;
`;
const BlockOrderItemQuantityOk = styled.Text`
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
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
  height: ${screenHeight < 760 ? "50px" : "70px"};
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
  height: ${screenHeight < 760 ? "50px" : "70px"};
  flex-direction: row;
  justify-content: space-around;
`;
const ModalBlockInput = styled.View`
  width: 100%;
  height: ${screenHeight < 760 ? "180px" : "200px"};
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;
const ModalBlockAddNew = styled.View`
  width: 100%;
  height: 95%;
  position: absolute;
  padding-left: 1%;
  padding-right: 1%;
`;
const ModalBlockAddNewInput = styled.View`
  width: 100%;
  margin-top: 38%;
  height: ${screenHeight < 760 ? "180px" : "200px"};
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;
const ModalButton = styled.TouchableOpacity`
  width: 30%;
  height: ${screenHeight < 760 ? "50px" : "60px"};
`;
const InputFieldName = styled.TextInput`
  width: 70%;
  height: ${screenHeight < 760 ? "50px" : "70px"};
  background-color: ${colors.orderScreenModalInputBackgroung};
  border-radius: 18px;
  padding-left: 2%;
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
`;
const InputFieldQuantity = styled.TextInput`
  width: 25%;
  height: ${screenHeight < 760 ? "50px" : "70px"};
  background-color: ${colors.orderScreenModalInputBackgroung};
  margin-left: 5%;
  border-radius: 12px;
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
  text-align: center;
`;

const BlockButton = styled.View`
  width: 100%;
  height: ${screenHeight < 760 ? "60px" : "80px"};
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
  width: 95%;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 2px;
`;
const BlockButtonBtn = styled.TouchableOpacity`
  width: 30%;
  height: ${screenHeight < 760 ? "40px" : "50px"};
`;
const BlockButtonBtnBack = styled.TouchableOpacity`
  aspect-ratio: 1;
  height: ${screenHeight < 760 ? "40px" : "50px"};
`;
const AddParticipantModal = styled.View`
  height: 95%;
  width: 100%;
  position: absolute;
  z-index: 3;
`;
const BlockAlredyPartc = styled.View`
  background-color: ${colors.modalNiknameBackgroundWindow};
  width: 100%;
  height: 400px;
  margin-top: 5px;
  flex-direction: column;
  padding-left: 10px;
  padding-right: 10px;
`;
const BlockAlredyPartcTitle = styled.Text`
  text-align: center;
  font-size: ${screenHeight < 760 ? "20px" : "25px"};
  color: ${colors.OrderDashboardName};
`;
const BlockAlredyPartcTouch = styled.TouchableOpacity``;
const BlockAlredyPartcText = styled.Text`
  font-size: ${screenHeight < 760 ? "18px" : "20px"};
`;
export default memo(function OrderScreen({ route, navigation }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [modalAddPosition, setModalAddPosition] = useState(false);
  const [modalAddParticipant, setModalAddParticipant] = useState(false);
  const [orders, setOrders] = useState(null);
  const [dataItem, setDataItem] = useState(null);
  const [toggleBoughtItems, setToggleBoughtItems] = useState(false);
  const [newMessageArrived, setNewMessageArrived] = useState(false);
  const { item } = route.params;
  const currentUserEmail = auth.currentUser.email;
  const documentId = item.docId;
  const { t } = useTranslation();
  const nameOfOrder = item.nameOfOrder;
  const isOrderCreator = item.participants[0] === currentUserEmail;

  const delParticipantFromOrder = async (participantForDeleting) => {
    if (participantForDeleting === currentUserEmail) {
      return Alert.alert(t("OrderScreenAlertDelMyself"));
    }

    Alert.alert(t("OrderScreenConfirmDeleteTitle"), `${participantForDeleting} ${t("OrderScreenConfirmDeleteText")}`, [
      {
        text: t("ProffileCancel"),
        style: "cancel",
      },
      {
        text: t("messageModalDelete"),
        style: "destructive",
        onPress: async () => {
          try {
            const firebaseRef = doc(db, "orders", documentId);
            await updateDoc(firebaseRef, {
              participants: arrayRemove(participantForDeleting),
            });
          } catch (error) {
            console.log("delParticipantFromOrder", error.message);
          }
        },
      },
    ]);
  };

  const updateParticipants = async (p) => {
    const email = p.email;
    Alert.alert(`${t("OrderScreenAlertText")}`, `${email}`, [
      {
        text: `${t("ProffileCancel")}`,
        onPress: () => {
          return;
        },
        style: "cancel",
      },
      {
        text: `${t("OrderScreenAlertAdd")}`,
        onPress: async () => {
          const firebaseRef = doc(db, "orders", documentId);
          await updateDoc(firebaseRef, {
            participants: arrayUnion(email),
          });
          sendPersonalMessage(email);
        },
      },
    ]);
  };
  const sendPersonalMessage = async (email) => {
    const docSnap = await getDoc(doc(db, "users", email));
    const pushToken = docSnap.data().pushToken;
    try {
      const message = {
        to: pushToken,
        sound: "default",
        title: `New ORDER with name ${nameOfOrder}`,
        body: "Do not forget to complete me!!!",
        data: { someData: item },
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
      return Alert.alert(`${t("OrderScreenAlertEmptyField")}`);
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
            ? nameOfOrder +
              " " +
              new Date(new Date(orders.dateForOrder)).toLocaleDateString(`${t("OrderDashboardTime")}`, {
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
              <Ionicons
                name="arrow-back-circle-outline"
                size={screenHeight < 760 ? 30 : 40}
                color={colors.BlockButtonText}
              />
            </LinearGradient>
          </BlockButtonBtnBack>
          <BlockButtonBtn
            onPress={() => {
              setModalAddPosition(true);
            }}
          >
            <Button children={t("OrderScreenAdd")} />
          </BlockButtonBtn>
          <BlockButtonBtn
            onPress={() => {
              setNewMessageArrived(false);
              navigation.navigate("Messaging", { item });
            }}
          >
            {newMessageArrived ? (
              <NewMessageAlert>
                <Ionicons
                  name="alert-circle-sharp"
                  size={screenHeight < 760 ? 15 : 20}
                  color={colors.NewMessageArrivedColor}
                />
              </NewMessageAlert>
            ) : null}

            <Button children={t("OrderScreenMessaging")} />
          </BlockButtonBtn>
        </BlockButton>
        <BlockSafeAreaView style={{ height: screenHeight < 760 ? "93%" : "98%" }}>
          {modalUpdate ? (
            <ModalBlock>
              <ModalBlockInput>
                <InputFieldName
                  onChangeText={setName}
                  maxLength={25}
                  value={name}
                  placeholder={t("OrderScreenModalPlaceholderItem")}
                ></InputFieldName>
                <InputFieldQuantity
                  onChangeText={setQuantity}
                  value={quantity}
                  maxLength={7}
                  placeholder={t("OrderScreenModalPlaceholderQT")}
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
                  <Button children={t("ProffileCancel")} />
                </ModalButton>
                <ModalButton onPress={() => updateOrder()}>
                  <Button children={t("OrderScreenModalUpdate")} />
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
                      accessibilityLabel="Task list"
                      accessible={true}
                      renderItem={({ item }) => (
                        <BlockOrderItemOk>
                          <BlockOrderItemOkInfo
                            accessibilityLabel={`Task: ${(item.name, item.quantity)}`}
                            accessible={true}
                          >
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
                        accessibilityLabel="Task list"
                        accessible={true}
                        data={orders.order.filter((e) => e.made !== true)}
                        renderItem={(data, rowMap, index) => (
                          <BlockOrderItem
                            key={index}
                            accessibilityLabel={`Task: ${(item.name, item.quantity)}`}
                            accessible={true}
                          >
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
                              <Ionicons color="white" size={screenHeight < 760 ? 20 : 30} name="create"></Ionicons>
                            </HidenUpdate>
                            <HidenOk
                              onPress={() => {
                                setDataItem(data.item);
                                okOrder(data.item);
                              }}
                            >
                              <Entypo name="check" size={screenHeight < 760 ? 20 : 30} color="white" />
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
            style={{ marginLeft: "5%" }}
            onPress={() => {
              setModalAddParticipant(true);
            }}
          >
            <Button children={t("OrderScreenAddParts")} />
          </BlockButtonBtn>
          <BlockButtonBtn
            onPress={() => {
              setToggleBoughtItems(!toggleBoughtItems);
            }}
          >
            <Button children={toggleBoughtItems ? `${t("OrderScreenOrderItems")}` : `${t("OrderScreenBoughtItems")}`} />
          </BlockButtonBtn>
        </BlockButtonToggle>
      </Container>
      <View style={{ position: "absolute", bottom: 0, paddingleft: "1%" }}>
        <BannerAd
          unitId="ca-app-pub-9267417700367649/6433322697"
          onAdFailedToLoad={(error) => console.log(error)}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </View>
      {modalAddParticipant ? (
        <AddParticipantModal>
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
            <BlockButtonBtnBack
              accessibilityLabel="Button go back to order screen"
              accessible={true}
              style={{ marginTop: "19%", marginLeft: "5%" }}
              onPress={() => {
                setModalAddParticipant(false);
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
                <Ionicons
                  name="arrow-back-circle-outline"
                  size={screenHeight < 760 ? 30 : 40}
                  color={colors.BlockButtonText}
                />
              </LinearGradient>
            </BlockButtonBtnBack>
            <View style={{ height: "100px" }}>
              <View style={{ height: 100, marginTop: 10, marginBottom: 10 }}>
                <AddingParticipant updateParticipants={updateParticipants} />
              </View>
              <BlockAlredyPartc>
                <BlockAlredyPartcTitle>{t("OrderScreenAlredyParticipate")}</BlockAlredyPartcTitle>
                <FlatList
                  data={orders.participants}
                  accessibilityLabel={`Alredy participate: ${item}`}
                  accessible={true}
                  renderItem={({ item }) => (
                    <BlockAlredyPartcTouch onPress={() => (isOrderCreator ? delParticipantFromOrder(item) : null)}>
                      <BlockAlredyPartcText>{item}</BlockAlredyPartcText>
                    </BlockAlredyPartcTouch>
                  )}
                  keyExtractor={(item) => item}
                  ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
                />
              </BlockAlredyPartc>
            </View>
          </LinearGradient>
        </AddParticipantModal>
      ) : null}
      {modalAddPosition ? (
        <ModalBlockAddNew>
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
            <ModalBlockAddNewInput>
              <InputFieldName
                onChangeText={setName}
                maxLength={25}
                value={name}
                placeholder={t("OrderScreenModalPlaceholderItem")}
              ></InputFieldName>
              <InputFieldQuantity
                onChangeText={setQuantity}
                value={quantity}
                maxLength={7}
                placeholder={t("OrderScreenModalPlaceholderQT")}
              ></InputFieldQuantity>
            </ModalBlockAddNewInput>
            <ModalBlockBtn>
              <ModalButton
                onPress={() => {
                  setModalAddPosition(false);
                  setName("");
                  setQuantity("");
                  setDataItem("");
                }}
              >
                <Button children={t("ProffileCancel")} />
              </ModalButton>
              <ModalButton
                onPress={() => {
                  updateOrder();
                  setModalAddPosition(false);
                }}
              >
                <Button children={t("OrderScreenModalAddPosition")} />
              </ModalButton>
            </ModalBlockBtn>
          </LinearGradient>
        </ModalBlockAddNew>
      ) : null}
    </LinearGradient>
  );
});
