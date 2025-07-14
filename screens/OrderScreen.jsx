import { View, Text, TouchableOpacity, TextInput, FlatList, Alert, StyleSheet, ScrollView } from "react-native";
import { useState, useEffect, memo, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as colors from "../variables/colors";
import { StatusBar } from "expo-status-bar";
import { db, auth } from "../firebaseConfig";
import ModalAddNewPosition from "../components/ModalAddNewPosition";
import ModalAddNewParticipant from "../components/ModalAddNewParticipant";
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
import { useTranslation } from "react-i18next";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { Dimensions } from "react-native";

const screenHeight = Dimensions.get("screen").height;

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
  const swipeListRef = useRef(null);

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
    const unsub = onSnapshot(doc(db, "orders", documentId), (snapshot) => {
      setOrders(snapshot.data());
      setOrdersLoaded(true);
    });
    checkUnreadMessages();
    return () => unsub();
  }, []);
  const updateOrder = async () => {
    try {
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
    } catch (error) {
      console.log("updateDoc", error.message);
    }
  };

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
      style={styles.linearGradient}
    >
      <StatusBar style="light" />
      <View style={styles.container}>
        <Text style={[styles.orderName, { color: colors.titleText }]}>
          {ordersLoaded
            ? `${nameOfOrder} ${new Date(orders.dateForOrder).toLocaleDateString(t("OrderDashboardTime"), {
                month: "long",
                day: "numeric",
              })}`
            : "loading..."}
        </Text>

        <View style={styles.blockButton}>
          <TouchableOpacity style={styles.blockButtonBack} onPress={() => navigation.goBack()}>
            <LinearGradient
              colors={[
                colors.startColorForGradientButton,
                colors.endColorForGradientButton,
                colors.startColorForGradientButton,
                colors.endColorForGradientButton,
              ]}
              start={{ x: 0.0, y: 0.0 }}
              end={{ x: 1.0, y: 1.0 }}
              style={styles.buttonGradient}
            >
              <Ionicons
                name="arrow-back-circle-outline"
                size={screenHeight < 760 ? 30 : 40}
                color={colors.BlockButtonText}
              />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.blockButtonBtn} onPress={() => setModalAddPosition(true)}>
            <Button children={t("OrderScreenAdd")} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.blockButtonBtn}
            onPress={() => {
              setNewMessageArrived(false);
              navigation.navigate("Messaging", { item });
            }}
          >
            {newMessageArrived && (
              <View style={styles.newMessageAlert}>
                <Ionicons
                  name="alert-circle-sharp"
                  size={screenHeight < 760 ? 15 : 20}
                  color={colors.NewMessageArrivedColor}
                />
              </View>
            )}
            <Button children={t("OrderScreenMessaging")} />
          </TouchableOpacity>
        </View>

        <View style={[styles.blockSafeAreaView, { height: screenHeight < 760 ? "93%" : "98%" }]}>
          {modalUpdate ? (
            <View style={styles.modalBlock}>
              <View style={styles.modalBlockInput}>
                <TextInput
                  style={[styles.inputFieldName, { backgroundColor: colors.orderScreenModalInputBackgroung }]}
                  onChangeText={setName}
                  maxLength={25}
                  value={name}
                  placeholder={t("OrderScreenModalPlaceholderItem")}
                />
                <TextInput
                  style={[styles.inputFieldQuantity, { backgroundColor: colors.orderScreenModalInputBackgroung }]}
                  onChangeText={setQuantity}
                  value={quantity}
                  maxLength={7}
                  placeholder={t("OrderScreenModalPlaceholderQT")}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalBlockBtn}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setModalUpdate(false);
                    setName("");
                    setQuantity("");
                    setDataItem("");
                  }}
                >
                  <Button children={t("ProffileCancel")} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={updateOrder}>
                  <Button children={t("OrderScreenModalUpdate")} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.blockOrder}>
              {toggleBoughtItems
                ? ordersLoaded && (
                    <FlatList
                      data={orders.order.filter((e) => e.made === true)}
                      keyExtractor={(_, index) => index.toString()}
                      renderItem={({ item }) => (
                        <View
                          style={[styles.blockOrderItemOk, { backgroundColor: colors.orderScreenItemBackgroundOk }]}
                        >
                          <View style={styles.blockOrderItemOkInfo}>
                            <Text style={[styles.itemTextOk, { color: colors.orderScreenItemText }]}>{item.name}</Text>
                            <Text style={[styles.itemQuantityOk, { color: colors.orderScreenItemText }]}>
                              {item.quantity}
                            </Text>
                          </View>
                          <Text style={styles.blockOrderItemOkAuthor}>{item.madeByDisplayName}</Text>
                        </View>
                      )}
                    />
                  )
                : ordersLoaded && (
                    <View style={styles.blockOrderItemAll}>
                      <SwipeListView
                        ref={swipeListRef}
                        style={styles.swipeList}
                        data={orders.order.filter((e) => e.made !== true)}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item }) => (
                          <View style={[styles.blockOrderItem, { backgroundColor: colors.orderScreenItemBackground }]}>
                            <Text style={[styles.itemText, { color: colors.orderScreenItemText }]}>{item.name}</Text>
                            <Text style={[styles.itemQuantity, { color: colors.orderScreenItemText }]}>
                              {item.quantity}
                            </Text>
                          </View>
                        )}
                        renderHiddenItem={({ item, index }, rowMap) => (
                          <View style={styles.hiden}>
                            <TouchableOpacity
                              style={[styles.hidenUpdate, { backgroundColor: colors.orderScreenHiddenOk }]}
                              onPress={() => {
                                setName(item.name);
                                setQuantity(item.quantity);
                                setDataItem(item);
                                setModalUpdate(true);
                              }}
                            >
                              <Ionicons color="white" size={screenHeight < 760 ? 20 : 30} name="create" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.hidenOk, { backgroundColor: colors.orderScreenHiddenUpdate }]}
                              onPress={() => {
                                setDataItem(item);
                                okOrder(item);
                                if (rowMap[index]) {
                                  rowMap[index].closeRow();
                                }
                              }}
                            >
                              <Entypo name="check" size={screenHeight < 760 ? 20 : 30} color="white" />
                            </TouchableOpacity>
                          </View>
                        )}
                        rightOpenValue={-130}
                      />
                    </View>
                  )}
            </View>
          )}
        </View>

        <View style={styles.blockButtonToggle}>
          <TouchableOpacity
            style={[styles.blockButtonBtn, { marginLeft: "5%" }]}
            onPress={() => setModalAddParticipant(true)}
          >
            <Button children={t("OrderScreenAddParts")} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.blockButtonBtn} onPress={() => setToggleBoughtItems(!toggleBoughtItems)}>
            <Button children={toggleBoughtItems ? t("OrderScreenOrderItems") : t("OrderScreenBoughtItems")} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.bannerAd}>
        <BannerAd
          unitId="ca-app-pub-9267417700367649/6433322697"
          onAdFailedToLoad={(error) => console.log(error)}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </View>
      {modalAddParticipant && (
        <ModalAddNewParticipant
          setModalAddParticipant={setModalAddParticipant}
          item={item}
          currentUserEmail={currentUserEmail}
          orders={orders}
          documentId={documentId}
          nameOfOrder={nameOfOrder}
        />
      )}
      {modalAddPosition && (
        <ModalAddNewPosition
          documentId={documentId}
          currentUserEmail={currentUserEmail}
          setDataItem={setDataItem}
          setModalAddPosition={setModalAddPosition}
        />
      )}
    </LinearGradient>
  );
});
const styles = StyleSheet.create({
  linearGradient: {
    height: "100%",
    width: "100%",
    paddingTop: "5%",
  },
  container: {
    width: "100%",
    height: "70%",
    padding: "1%",
    paddingTop: "5%",
  },
  orderName: {
    fontSize: screenHeight < 760 ? 20 : 25,
    textAlign: "center",
    marginBottom: "2%",
  },
  blockButton: {
    width: "100%",
    height: screenHeight < 760 ? 60 : 80,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: "2%",
  },
  blockButtonBtn: {
    width: "30%",
    height: screenHeight < 760 ? 40 : 50,
  },
  blockButtonBack: {
    aspectRatio: 1,
    height: screenHeight < 760 ? 40 : 50,
  },
  buttonGradient: {
    height: "100%",
    width: "100%",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  newMessageAlert: {
    position: "absolute",
    right: 15,
    top: -10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  blockSafeAreaView: {
    width: "100%",
  },
  blockOrder: {
    height: "99%",
  },
  blockOrderItemAll: {
    height: "100%",
    marginBottom: "2%",
  },
  blockOrderItem: {
    flexDirection: "row",
    height: screenHeight < 760 ? 50 : 70,
    alignItems: "center",
    marginBottom: "1%",
  },
  itemText: {
    width: "70%",
    fontSize: screenHeight < 760 ? 15 : 20,
    marginLeft: "2%",
  },
  itemQuantity: {
    fontSize: screenHeight < 760 ? 15 : 20,
    marginLeft: "1%",
    width: "26%",
  },
  hiden: {
    height: screenHeight < 760 ? 50 : 70,
    width: "30%",
    flexDirection: "row",
    position: "absolute",
    right: 0,
    justifyContent: "space-around",
    alignItems: "center",
  },
  hidenUpdate: {
    width: "45%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  hidenOk: {
    width: "45%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  blockOrderItemOk: {
    flexDirection: "column",
    height: screenHeight < 760 ? 50 : 70,
    alignItems: "center",
    marginBottom: "1%",
  },
  blockOrderItemOkInfo: {
    flexDirection: "row",
    height: "70%",
    alignItems: "center",
    width: "100%",
  },
  itemTextOk: {
    width: "70%",
    fontSize: screenHeight < 760 ? 15 : 20,
    marginLeft: "2%",
  },
  itemQuantityOk: {
    fontSize: screenHeight < 760 ? 15 : 20,
    marginLeft: "1%",
    width: "26%",
  },
  blockOrderItemOkAuthor: {
    textAlign: "center",
    width: "100%",
    height: "20%",
    fontSize: screenHeight < 760 ? 8 : 10,
  },
  modalBlock: {
    width: "100%",
    height: "95%",
  },
  modalBlockInput: {
    width: "100%",
    height: screenHeight < 760 ? 180 : 200,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBlockBtn: {
    width: "100%",
    height: screenHeight < 760 ? 50 : 70,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalButton: {
    width: "30%",
    height: screenHeight < 760 ? 50 : 60,
  },
  inputFieldName: {
    width: "70%",
    height: screenHeight < 760 ? 50 : 70,
    borderRadius: 18,
    paddingLeft: "2%",
    fontSize: screenHeight < 760 ? 15 : 20,
  },
  inputFieldQuantity: {
    width: "25%",
    height: screenHeight < 760 ? 50 : 70,
    marginLeft: "5%",
    borderRadius: 12,
    fontSize: screenHeight < 760 ? 15 : 20,
    textAlign: "center",
  },
  blockButtonToggle: {
    width: "95%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 2,
  },
  bannerAd: {
    position: "absolute",
    bottom: 0,
    paddingLeft: "1%",
  },
  swipeList: {
    width: "100%",
    height: "100%",
  },
});
