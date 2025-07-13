import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as colors from "../variables/colors";
import { db } from "../firebaseConfig";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AddingParticipant from "./AddingParticipant";

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
          const firebaseRef = doc(db, "orders", documentId);
          await updateDoc(firebaseRef, {
            participants: arrayUnion(email),
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
            data={orders.participants}
            accessibilityLabel="Already participate"
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => (isOrderCreator ? delParticipantFromOrder(item) : null)}>
                <Text style={styles.participantText}>{item}</Text>
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
