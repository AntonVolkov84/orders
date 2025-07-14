import { View, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useState } from "react";
import { doc, getDoc, arrayUnion, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Button from "./Button";
import { db } from "../firebaseConfig";
import { useTranslation } from "react-i18next";
import * as colors from "../variables/colors";
import { auth } from "../firebaseConfig";

const styles = StyleSheet.create({
  modal: {
    width: "100%",
    height: "100%",
    padding: "2%",
    backgroundColor: colors.orderBackgroundColor,
    zIndex: 4,
  },
  modalInput: {
    width: "100%",
    height: 50,
    backgroundColor: colors.backgroundColorInput,
    color: colors.colorTextInput,
    fontSize: 20,
    paddingLeft: "2%",
    borderRadius: 10,
  },
  modalButton: {
    width: "100%",
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: "1%",
  },
  modalButtonBtn: {
    width: "25%",
    height: "100%",
  },
});

const ModalAddingParticipant = ({ setAddingParticipantModal }) => {
  const [inputEmail, setInputEmail] = useState("");
  const { t } = useTranslation();
  const currentEmail = auth.currentUser.email;

  const isParticipantExists = async (emailToCheck) => {
    const docRef = doc(db, "Participants", currentEmail);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const participants = data.participants || [];
        return participants.includes(emailToCheck);
      } else {
        return false;
      }
    } catch (error) {
      console.log("Ошибка при проверке участника:", error.message);
      return false;
    }
  };

  const VerificationMailDublicate = async (email) => {
    try {
      if (!(await isParticipantExists(email))) {
        verificationInputMail(email);
      } else {
        return Alert.alert(`${t("AddingParticipantsDublicate")}`);
      }
    } catch (error) {
      console.log("VerificationMailDublicate", error.message);
    }
  };

  const verificationInputMail = async (email) => {
    if (email === auth.currentUser.email) {
      return Alert.alert(`${t("AddingParticipantsAlertExistYourself")}`);
    }
    try {
      const docSnap = await getDoc(doc(db, "users", email));
      if (docSnap.exists()) {
        addToParticipantsRefactor(email);
      } else {
        Alert.alert(`${t("AddingParticipantsAlertNotIn")}`);
      }
    } catch (error) {
      Alert.alert("Participant doesn`t exict", error.message);
    }
  };

  const addToParticipantsRefactor = async (email) => {
    try {
      await setDoc(
        doc(db, "Participants", currentEmail),
        {
          participants: arrayUnion(email),
        },
        { merge: true }
      );
      setInputEmail("");
      setAddingParticipantModal(false);
    } catch (error) {
      console.log("addToParticipantsRefactor", error.message);
    }
  };

  return (
    <View style={styles.modal}>
      <TextInput
        placeholder={t("AddingParticipantsModalPlaceholder")}
        value={inputEmail}
        onChangeText={setInputEmail}
        style={styles.modalInput}
      />
      <View style={styles.modalButton}>
        <TouchableOpacity
          accessibilityLabel="Button go back from modal window adding participant to global list"
          accessible={true}
          onPress={() => {
            setAddingParticipantModal(false);
            setInputEmail("");
          }}
          style={styles.modalButtonBtn}
        >
          <Button>{t("ProffileCancel")}</Button>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel="Button adding participant to global list"
          accessible={true}
          onPress={() => {
            VerificationMailDublicate(inputEmail);
          }}
          style={styles.modalButtonBtn}
        >
          <Button>{t("AddingParticipantsCheck")}</Button>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ModalAddingParticipant;
