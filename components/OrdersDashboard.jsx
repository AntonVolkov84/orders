import { View, Text, TouchableOpacity, Image, Alert, StyleSheet, Dimensions } from "react-native";
import { useState, useEffect, memo } from "react";
import * as colors from "../variables/colors";
import { db, app } from "../firebaseConfig";
import { getDoc, doc, deleteDoc, addDoc, collection, getDocs } from "firebase/firestore";
import Button from "./Button";
import { useTranslation } from "react-i18next";
import * as Device from "expo-device";
import { getStorage, ref, deleteObject } from "firebase/storage";

const screenHeight = Dimensions.get("screen").height;

const styles = StyleSheet.create({
  blockOrderShow: {
    width: "100%",
    backgroundColor: colors.blockMenuProfile,
    height: screenHeight < 760 ? 150 : 200,
    marginTop: "1%",
  },
  blockOrder: {
    width: "100%",
    height: "100%",
    flexDirection: "column",
  },
  blockOrderCreator: {
    width: "25%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "1%",
    marginRight: "1%",
  },
  blockOrderInfo: {
    width: "73%",
    height: "100%",
    marginRight: "1%",
    flexDirection: "column",
    overflow: "hidden",
  },
  blockInfoNameDate: {
    width: "100%",
    height: "18%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  blockOrderInfoName: {
    height: "100%",
    fontSize: screenHeight < 760 ? 18 : 23,
    textAlign: "center",
    color: colors.OrderDashboardName,
    marginRight: "3%",
  },
  blockOrderInfoDate: {
    height: "100%",
    fontSize: screenHeight < 760 ? 18 : 23,
    textAlign: "center",
    color: colors.OrderDashboardName,
  },
  blockOrderInfoArr: {
    width: "99%",
    height: "85%",
    marginRight: "1%",
    fontSize: screenHeight < 760 ? 18 : 23,
    textAlign: "center",
    overflow: "hidden",
  },
  blockOrderCreatorAvatar: {
    width: "80%",
    aspectRatio: 1,
    borderRadius: 150,
  },
  blockOrderCreatorName: {
    fontSize: screenHeight < 760 ? 15 : 20,
    width: "100%",
    height: "20%",
    textAlign: "center",
  },
  closeOrderBtn: {
    height: screenHeight < 760 ? 40 : 50,
    width: "40%",
    position: "absolute",
    bottom: "8%",
    right: "3%",
  },
});

const OrdersDashboard = memo(function OrdersDashboard({ item, navigation }) {
  const [orderCreatorProfile, setOrderCreatorProfile] = useState(null);
  const [loadingOrderCreatorProfile, setLoadingOrderCreatorProfile] = useState(false);
  const dateForOrder = new Date(item.dateForOrder);
  const nameForOrder = item.nameOfOrder;
  const { t } = useTranslation();
  const storage = getStorage(app);

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
        Alert.alert(`${t("OrderDashboardAlertClose")}`);
        const arr = [];
        const delMessages = await getDocs(collection(db, "messages", docId, "conversation"));
        delMessages.forEach((doc) => {
          arr.push(doc.id);
          if (doc.data().type === "image") {
            console.log(doc.data().staragePath);
            deleteImageFromStorage(doc.data().staragePath);
          }
        });
        arr.forEach(async (id) => {
          await deleteDoc(doc(db, "messages", docId, "conversation", id));
        });
      } else {
        return Alert.alert(`${t("OrderDashboardAlertNotClose")}`);
      }
    }
  };

  const deleteImageFromStorage = async (path) => {
    const imageRef = ref(storage, `images/${path}`);
    try {
      await deleteObject(imageRef);
    } catch (error) {
      console.error(`Ошибка при удалении ${path}:`, error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.blockOrderShow}
      onPress={() => {
        navigation.navigate("OrderScreen", { item });
      }}
    >
      {loadingOrderCreatorProfile ? (
        <View style={styles.blockOrder}>
          <View style={styles.blockInfoNameDate}>
            <Text style={styles.blockOrderInfoName}>{nameForOrder || "No name"}</Text>
            <Text style={styles.blockOrderInfoDate}>
              {Device.osVersion <= 6
                ? new Date(dateForOrder).toLocaleDateString()
                : new Date(dateForOrder).toLocaleDateString(`${t("OrderDashboardTime")}`, {
                    month: "long",
                    day: "numeric",
                  })}
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={styles.blockOrderCreator}>
              <Image
                style={styles.blockOrderCreatorAvatar}
                source={{
                  uri: orderCreatorProfile.photoURL,
                }}
              />
              <Text style={styles.blockOrderCreatorName}>{orderCreatorProfile.nikname}</Text>
            </View>
            <View style={styles.blockOrderInfo}>
              <Text style={styles.blockOrderInfoArr}>{item.order.map((e) => e.name + ", ")}</Text>
              <TouchableOpacity style={styles.closeOrderBtn} onPress={() => delCompliteOrder(item.docId)}>
                <Button>{t("OrderDashboardCloseOrder")}</Button>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
    </TouchableOpacity>
  );
});

export default OrdersDashboard;
