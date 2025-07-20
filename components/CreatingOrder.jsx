import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useState, memo, useRef } from "react";
import * as colors from "../variables/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Button from "../components/Button";
import Feather from "@expo/vector-icons/Feather";
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import { sendPushNotification } from "../notifications";

const screenHeight = Dimensions.get("screen").height;

export default memo(function CreatingOrder({ participants, setCreateOrderModal, setParticipants }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [nameOfOrder, setNameForOrder] = useState("");
  const [dateForOrder, setDateForOrder] = useState(new Date());
  const [orders, setOrders] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const { t } = useTranslation();
  const nameOrder = useRef(null);

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
    nameOrder.current.focus();
  };

  const delFromChart = (id) => {
    const newOrders = orders.filter((order) => order.id !== id);
    setOrders(newOrders);
  };

  const sendNotificationWhithNewOrders = async (arrOfParicipantsEmail) => {
    const arrOfReseiver = [];
    if (arrOfParicipantsEmail.length < 2) return;
    for (let i = 1; i < arrOfParicipantsEmail.length; i++) {
      const docSnap = await getDoc(doc(db, "users", arrOfParicipantsEmail[i]));
      arrOfReseiver.push(docSnap.data().pushToken);
    }
    try {
      await sendPushNotification(arrOfReseiver, "Do not forget to complete me!!!", `New ORDER ${nameOfOrder}`);
    } catch (error) {
      console.log(error);
    }
  };
  const getParticipantsPublicKeys = async (emails) => {
    const result = [];
    for (const email of emails) {
      try {
        const userRef = doc(db, "users", email);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.publicKey) {
            result.push({ email, publicKey: data.publicKey });
          } else {
            console.warn(`🔐 У пользователя ${email} нет publicKey`);
          }
        } else {
          console.warn(`❌ Пользователь ${email} не найден`);
        }
      } catch (error) {
        console.error(`🔥 Ошибка при получении ключа пользователя ${email}:`, error);
      }
    }
    return result;
  };
  const fetchOrders = async () => {
    const currentEmail = auth.currentUser.email;
    const arrOfParicipantsEmail = [currentEmail];
    participants.map((e) => arrOfParicipantsEmail.push(e.email));
    const publicKeys = await getParticipantsPublicKeys(arrOfParicipantsEmail);
    sendNotificationWhithNewOrders(arrOfParicipantsEmail);
    try {
      const order = {
        timestamp: serverTimestamp(),
        nameOfOrder: nameOfOrder,
        dateForOrder: Date.parse(dateForOrder),
        participants: arrOfParicipantsEmail,
        order: [...orders],
        orderId: Date.parse(new Date()),
        publicKeys,
      };
      const res = await addDoc(collection(db, "orders"), order);
      const docId = res.id;
      await setDoc(doc(db, "Orders status", docId), { isClosed: false });
    } catch (error) {
      console.log("add to users", error);
    }
  };
  const makeOrder = async () => {
    if (!nameOfOrder) return Alert.alert(`${t("CreatingOrderNameAlert")}`);
    if (orders.length < 1) return Alert.alert(`${t("CreatingOrderInputAlert")}`);
    fetchOrders()
      .then(() => setParticipants([]))
      .then(() => setOrders([]))
      .then(() => setNameForOrder(""))
      .then(() => setCreateOrderModal(false));
  };
  return (
    <View style={styles.blockAddingOrder}>
      <Text style={styles.title}>{t("CreatingOrderCreate")}</Text>
      <View style={styles.nameRow}>
        <Text style={styles.label}>{t("CreatingOrderName")}:</Text>
        <TextInput
          ref={nameOrder}
          style={styles.inputName}
          onChangeText={setNameForOrder}
          value={nameOfOrder}
          maxLength={14}
          placeholder={t("CreatingOrderNamePlaceholder")}
        />
      </View>
      <View style={styles.participantsRow}>
        <Text style={styles.label}>{t("CreatingOrderParticipants")}</Text>
        {Boolean(participants.length) && (
          <ScrollView
            horizontal
            accessibilityLabel="Choosen participants"
            accessible={true}
            style={styles.participantsScroll}
          >
            {participants.map((e, index) => (
              <Text key={index} style={styles.participantName} onPress={() => delFronArrayOfParticipants(e)}>
                {e.nikname + " "}
              </Text>
            ))}
          </ScrollView>
        )}
      </View>
      <View style={styles.dateRow}>
        <Text style={styles.label}>{t("CreatingOrderDate")}</Text>
        {showPicker && (
          <DateTimePicker
            accessibilityLabel="Input date for order"
            accessible={true}
            style={{ width: "80%", aspectRatio: 3 / 4 }}
            mode="date"
            value={new Date()}
            onChange={handleChangeDate}
          />
        )}
        <TouchableOpacity
          accessibilityLabel="Choose date for order"
          accessible={true}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.dateText}>{new Date(dateForOrder).toLocaleDateString("en-GB")}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.orderInputRow}>
        <TextInput
          ref={nameOrder}
          style={styles.orderInputName}
          onChangeText={setName}
          value={name}
          maxLength={25}
          placeholder={t("CreatingOrderPlaceholderName")}
        />
        <TextInput
          style={styles.orderInputQuantity}
          onChangeText={setQuantity}
          value={quantity}
          maxLength={7}
          placeholder={t("CreatingOrderPlaceholderQT")}
        />
        <TouchableOpacity
          accessibilityLabel="Button adding position to chart"
          accessible={true}
          style={styles.orderAddBtn}
          onPress={addingToChart}
        >
          <MaterialIcons
            name="shopping-cart-checkout"
            size={screenHeight < 760 ? 20 : 30}
            color={colors.placeolderColor}
          />
        </TouchableOpacity>
      </View>
      <SafeAreaView style={styles.scrollArea}>
        <ScrollView accessibilityLabel="Order selected position list" accessible={true}>
          {orders.map((order, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.orderName}>{order.name}</Text>
              <Text style={styles.orderQuantity}>{order.quantity}</Text>
              <TouchableOpacity
                accessibilityLabel="Button delete position from selected positions list"
                accessible={true}
                onPress={() => delFromChart(order.id)}
                style={styles.orderDeleteBtn}
              >
                <Feather name="delete" size={screenHeight < 760 ? 25 : 30} color={colors.titleText} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
      <View style={styles.resultBtnRow}>
        <TouchableOpacity
          accessibilityLabel="Button cancel"
          accessible={true}
          onPress={() => setCreateOrderModal(false)}
          style={styles.resultBtn}
        >
          <Button>{t("ProffileCancel")}</Button>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel="Button make order"
          accessible={true}
          onPress={makeOrder}
          style={styles.resultBtn}
        >
          <Button>{t("CreatingOrderMakeOrder")}</Button>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  blockAddingOrder: { flex: 1, width: "100%" },
  title: {
    color: colors.titleText,
    fontSize: screenHeight < 760 ? 15 : 20,
    alignSelf: "center",
  },
  nameRow: {
    flexDirection: "row",
    height: screenHeight < 760 ? 36 : 48,
    alignItems: "center",
  },
  label: {
    color: colors.titleText,
    fontSize: screenHeight < 760 ? 15 : 20,
  },
  inputName: {
    width: "54%",
    height: "100%",
    backgroundColor: colors.backgroundColorInput,
    borderRadius: 5,
    paddingHorizontal: "1%",
    color: colors.creatingOrderText,
    marginLeft: "2%",
    fontSize: screenHeight < 760 ? 15 : 20,
  },
  participantsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  participantsScroll: {
    marginLeft: "2%",
    width: "70%",
    overflow: "scroll",
  },
  participantName: {
    color: colors.titleText,
    fontSize: screenHeight < 760 ? 15 : 20,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  dateText: {
    color: colors.titleText,
    fontSize: screenHeight < 760 ? 15 : 20,
    marginLeft: "2%",
  },
  orderInputRow: {
    flexDirection: "row",
    width: "100%",
    height: screenHeight < 760 ? 40 : 50,
    paddingTop: "1%",
  },
  orderInputName: {
    width: "65%",
    height: "100%",
    backgroundColor: colors.backgroundColorInput,
    borderRadius: 5,
    paddingLeft: "1%",
    paddingRight: "1%",
    color: colors.creatingOrderText,
    fontSize: 15,
  },
  orderInputQuantity: {
    width: "20%",
    height: "100%",
    backgroundColor: colors.backgroundColorInput,
    borderRadius: 5,
    marginLeft: "1%",
    color: colors.creatingOrderText,
    fontSize: 15,
    paddingLeft: "1%",
  },
  orderAddBtn: {
    width: "13%",
    height: "100%",
    backgroundColor: colors.backgroundColorInput,
    borderRadius: 5,
    marginLeft: "1%",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollArea: {
    height: "45%",
    marginBottom: "1%",
  },
  orderItem: {
    flexDirection: "row",
    height: 44,
    alignItems: "center",
    paddingLeft: "1%",
  },
  orderName: {
    color: colors.titleText,
    fontSize: screenHeight < 760 ? 15 : 20,
    width: "67%",
  },
  orderQuantity: {
    color: colors.titleText,
    fontSize: screenHeight < 760 ? 15 : 20,
  },
  orderDeleteBtn: {
    position: "absolute",
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    width: "14%",
  },
  resultBtnRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },
  resultBtn: {
    width: "25%",
    height: screenHeight < 760 ? 40 : 50,
  },
});
