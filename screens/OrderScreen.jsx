import { View, Text, TouchableOpacity, TextInput, FlatList, Alert, ScrollView } from "react-native";
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
import { BannerAd, BannerAdSize, InterstitialAd, AdEventType, TestIds } from "react-native-google-mobile-ads";
import { Dimensions } from "react-native";

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
const ModalButton = styled.TouchableOpacity`
  width: 25%;
  height: ${screenHeight < 760 ? "50px" : "70px"};
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
const BlockAddingParticipant = styled.ScrollView`
  width: 100%;
  height: 100px;
  background-color: ${colors.modalNiknameBackgroundWindow};
  padding-left: 5%;
  padding-right: 5%;
  flex-direction: row;
  margin-top: 3%;
`;
const BlockParticipant = styled.TouchableOpacity`
  width: 100%;
  height: 100%;
  justify-content: center;
  width: 60px;
  margin-right: 1%;
  flex: 1;
`;
const BlockParticipantAvatar = styled.Image`
  border-radius: 100px;
  aspect-ratio: 1;
  object-fit: cover;
`;
const BlockParticipantName = styled.Text`
  color: ${colors.modalNiknameBackground};
  font-size: 12px;
  width: 100%;
  height: 20px;
  text-overflow: ellipsis;
  text-align: center;
`;
export default function OrderScreen({ route, navigation }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [modalAddParticipant, setModalAddParticipant] = useState(false);
  const [orders, setOrders] = useState(null);
  const [dataItem, setDataItem] = useState(null);
  const [toggleBoughtItems, setToggleBoughtItems] = useState(false);
  const [newMessageArrived, setNewMessageArrived] = useState(false);
  const [allParticipantsData, setAllParticipantsData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const { item } = route.params;
  const currentUserEmail = auth.currentUser.email;
  const documentId = item.docId;
  const { t } = useTranslation();
  const nameOfOrder = item.nameOfOrder;

  useEffect(() => {
    gettAllParticipants();
  }, [modalAddParticipant]);

  const updateParticipants = async (email) => {
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
          setModalAddParticipant(false);
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
        title: `You have got a new ORDER with name ${nameOfOrder}`,
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
  const gettAllParticipants = async () => {
    const currentEmail = auth.currentUser.email;
    try {
      const querySnapshot = await getDocs(collection(db, "AllParticipants", currentUserEmail, "PersonalParticipant"));
      const arr = querySnapshot.docs.map((doc) => doc.data().email);
      if (arr) {
        getdata(arr);
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const getdata = async (arr) => {
    const newArr = [];
    for (i = 0; i < arr.length; i++) {
      const docSnap = await getDoc(doc(db, "users", arr[i]));
      if (docSnap.exists()) {
        newArr.push(docSnap.data());
      }
      if (i === arr.length - 1) {
        setAllParticipantsData(newArr);
        setLoadingData(false);
      }
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
              setModalUpdate(true);
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
          unitId="ca-app-pub-3940256099942544/6300978111"
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
            networkExtras: {
              collapsible: "bottom",
            },
          }}
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
              style={{ marginTop: "19%", marginLeft: "5%" }}
              onPress={() => {
                setModalAddParticipant(false);
                setAllParticipantsData(null);
                setLoadingData(true);
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
              {loadingData ? (
                <Text>Loading...</Text>
              ) : (
                <BlockAddingParticipant horizontal>
                  {allParticipantsData.map((p, index) => (
                    <BlockParticipant
                      key={index}
                      onPress={() => {
                        updateParticipants(p.email);
                      }}
                    >
                      <BlockParticipantAvatar
                        source={{
                          uri: `${p.photoURL}`,
                        }}
                      ></BlockParticipantAvatar>
                      <BlockParticipantName numberOfLines={1}>{p.nikname || "No nikname"}</BlockParticipantName>
                    </BlockParticipant>
                  ))}
                </BlockAddingParticipant>
              )}
            </View>
          </LinearGradient>
        </AddParticipantModal>
      ) : null}
    </LinearGradient>
  );
}
