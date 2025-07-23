import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as colors from "../variables/colors";
import { db } from "../firebaseConfig";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AddingParticipant from "./AddingParticipant";
import { sendPushNotification } from "../notifications";

const screenHeight = Dimensions.get("screen").height;

export default function ModalAddNewParticipant({
  orders,
  nameOfOrder,
  documentId,
  currentUserEmail,
  item,
  setModalAddParticipant,
}) {
  const { t } = useTranslation();
  const isOrderCreator = item.participants[0] === currentUserEmail;

  const updateParticipants = async (p) => {
    const email = p.email;
    Alert.alert(`${t("OrderScreenAlertText")}`, `${email}`, [
      { text: t("ProffileCancel"), style: "cancel" },
      {
        text: t("OrderScreenAlertAdd"),
        onPress: async () => {
          const publicKey = await getParticipantsPublicKeys([email]);
          const firebaseRef = doc(db, "orders", documentId);
          await updateDoc(firebaseRef, {
            participants: arrayUnion(email),
            publicKeys: arrayUnion(publicKey[0]),
          });
          sendPersonalMessage(email);
        },
      },
    ]);
  };

  const delParticipantFromOrder = async (participantForDeleting) => {
    if (participantForDeleting === currentUserEmail) {
      return Alert.alert(t("OrderScreenAlertDelMyself"));
    }
    Alert.alert(t("OrderScreenConfirmDeleteTitle"), `${participantForDeleting} ${t("OrderScreenConfirmDeleteText")}`, [
      { text: t("ProffileCancel"), style: "cancel" },
      {
        text: t("messageModalDelete"),
        style: "destructive",
        onPress: async () => {
          try {
            const firebaseRef = doc(db, "orders", documentId);
            const orderSnap = await getDoc(firebaseRef);
            if (!orderSnap.exists()) {
              return console.warn("Order not found");
            }
            const orderData = orderSnap.data();
            const updatedPublicKeys = (orderData.publicKeys || []).filter(
              (item) => item.email !== participantForDeleting
            );
            await updateDoc(firebaseRef, {
              participants: arrayRemove(participantForDeleting),
              publicKeys: updatedPublicKeys,
            });
          } catch (error) {
            console.log("delParticipantFromOrder", error.message);
          }
        },
      },
    ]);
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
  const sendPersonalMessage = async (email) => {
    const docSnap = await getDoc(doc(db, "users", email));
    const pushToken = docSnap.data().pushToken;
    if (!pushToken) {
      console.warn("No push token found for", email);
      return;
    }
    try {
      await sendPushNotification(pushToken, "Do not forget to complete me!!!", `New ORDER ${nameOfOrder}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.modalContainer}>
      <LinearGradient
        colors={[
          colors.startColorForGradient,
          colors.endColorForGradient,
          colors.startColorForGradient,
          colors.endColorForGradient,
        ]}
        start={{ x: 0.0, y: 0.0 }}
        end={{ x: 1.0, y: 1.0 }}
        style={styles.gradient}
      >
        <TouchableOpacity
          style={styles.backButton}
          accessibilityLabel="Button go back to order screen"
          onPress={() => setModalAddParticipant(false)}
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
            style={styles.backButtonInner}
          >
            <Ionicons
              name="arrow-back-circle-outline"
              size={screenHeight < 760 ? 30 : 40}
              color={colors.BlockButtonText}
            />
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 100, marginVertical: 10 }}>
          <AddingParticipant updateParticipants={updateParticipants} />
        </View>

        <View style={styles.participantList}>
          <Text style={styles.participantTitle}>{t("OrderScreenAlredyParticipate")}</Text>
          <FlatList
            style={{ maxHeight: 250 }}
            data={orders.participants}
            accessibilityLabel="Already participate"
            renderItem={({ item }) => (
              <TouchableOpacity
                disabled={!isOrderCreator}
                onPress={() => isOrderCreator && delParticipantFromOrder(item)}
              >
                <Text style={[styles.participantText, item === currentUserEmail && { color: "#ae1fd1" }]}>
                  {item === currentUserEmail ? `Admin - ${item}` : item}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    height: "95%",
    width: "100%",
    position: "absolute",
    zIndex: 3,
  },
  gradient: {
    height: "100%",
    width: "100%",
    paddingTop: "5%",
  },
  backButton: {
    marginTop: "19%",
    marginLeft: "5%",
    height: screenHeight < 760 ? 40 : 50,
    aspectRatio: 1,
  },
  backButtonInner: {
    height: "100%",
    width: "100%",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  participantList: {
    backgroundColor: colors.modalNiknameBackgroundWindow,
    width: "100%",
    height: 400,
    marginTop: 5,
    paddingHorizontal: 10,
  },
  participantTitle: {
    textAlign: "center",
    fontSize: screenHeight < 760 ? 20 : 25,
    color: colors.OrderDashboardName,
  },
  participantText: {
    fontSize: screenHeight < 760 ? 18 : 20,
    color: "black",
  },
});
