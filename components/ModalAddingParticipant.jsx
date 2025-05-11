import { View, Text, Alert } from "react-native";
import { useState } from "react";
import styled from "styled-components";
import { doc, addDoc, collection, getDoc, getDocs, where, query, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Button from "./Button";
import { db } from "../firebaseConfig";
import { useTranslation } from "react-i18next";
import * as colors from "../variables/colors";

const Modal = styled.View`
  width: 100%;
  height: 100%;
  padding: 2%;
  background-color: ${colors.orderBackgroundColor};
  z-index: 4;
`;
const ModalInput = styled.TextInput`
  width: 100%;
  height: 50px;
  background-color: ${colors.backgroundColorInput};
  color: ${colors.colorTextInput};
  font-size: 20px;
  padding-left: 2%;
  border-radius: 10px;
`;
const ModalButton = styled.View`
  width: 100%;
  height: 30px;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  margin-top: 1%;
`;
const ModalButtonBtn = styled.TouchableOpacity`
  width: 25%;
  height: 100%;
`;

const ModalAddingParticipant = ({ gettAllParticipants, setAddingParticipantModal }) => {
  const [inputEmail, setInputEmail] = useState("");
  const { t } = useTranslation();
  const auth = getAuth();
  const VerificationMailDublicate = async (email) => {
    try {
      const docSnap = await getDocs(
        query(
          collection(db, "AllParticipants", auth.currentUser.email, "PersonalParticipant"),
          where("email", "==", email)
        )
      );
      if (!Boolean(docSnap.docs.length)) {
        verificationInputMail(email);
      } else {
        docSnap.forEach((e) => {
          return Alert.alert(`${t("AddingParticipantsDublicate")}`);
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const verificationInputMail = async (email) => {
    if (email === auth.currentUser.email) {
      return Alert.alert(`${t("AddingParticipantsAlertExistYourself")}`);
    }
    try {
      const docSnap = await getDoc(doc(db, "users", email));
      if (docSnap.exists()) {
        addToParticipant(email);
      } else {
        Alert.alert(`${t("AddingParticipantsAlertNotIn")}`);
      }
    } catch (error) {
      Alert.alert("Participant doesn`t exict", error.message);
    }
  };
  const addToParticipant = async (email) => {
    const currentEmail = auth.currentUser.email;
    try {
      const participant = {
        email: email,
      };
      await addDoc(collection(db, "AllParticipants", currentEmail, "PersonalParticipant"), participant);
      Alert.alert(`${t("AddingParticipantsAlertExist")}`);
      gettAllParticipants();
    } catch (error) {
      console.log("add to participant", error.message);
    }
  };
  return (
    <Modal>
      <ModalInput
        placeholder={t("AddingParticipantsModalPlaceholder")}
        value={inputEmail}
        onChangeText={setInputEmail}
      ></ModalInput>
      <ModalButton>
        <ModalButtonBtn
          accessibilityLabel="Button go back from modal window adding participant to global list"
          accessible={true}
          onPress={() => {
            setAddingParticipantModal(false);
            setInputEmail("");
          }}
        >
          <Button children={t("ProffileCancel")} />
        </ModalButtonBtn>
        <ModalButtonBtn
          accessibilityLabel="Button adding participant to global list"
          accessible={true}
          onPress={() => {
            VerificationMailDublicate(inputEmail);
            setAddingParticipantModal(false);
            setInputEmail("");
          }}
        >
          <Button children={t("AddingParticipantsCheck")} />
        </ModalButtonBtn>
      </ModalButton>
    </Modal>
  );
};

export default ModalAddingParticipant;
