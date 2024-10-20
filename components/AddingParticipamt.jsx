import { View, Text, TouchableOpacity, Alert, TextInput } from "react-native";
import React, { useState } from "react";
import styled from "styled-components";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as colors from "../variables/colors";
import { doc, addDoc, setDoc, collection, serverTimestamp, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Button from "./Button";
import { db } from "../firebaseConfig";

const BlockAdding = styled.View`
  width: 100%;
  height: 100%;
  flex-direction: row;
  align-items: center;
`;
const BlockIcon = styled.TouchableOpacity`
  height: 80%;
  aspect-ratio: 1;
  border: 2px solid;
  border-color: ${colors.APBorderColor};
  justify-content: center;
  align-items: center;
  border-radius: 100px;
  margin-right: 1%;
`;
const BlockParticipant = styled.TouchableOpacity`
  height: 80%;
  aspect-ratio: 1;
  border: 2px solid;
  border-color: ${colors.APBorderColor};
  justify-content: center;
  align-items: center;
  border-radius: 100px;
  margin-right: 1%;
`;
const Modal = styled.View`
  width: 100%;
  height: 100%;
  padding: 2%;
`;
const ModalInput = styled.TextInput`
  width: 100%;
  height: 100px;
  background-color: ${colors.backgroundColorInput};
  color: ${colors.colorTextInput};
  font-size: 40px;
  padding-left: 2%;
  border-radius: 10px;
`;
const ModalButton = styled.View`
  width: 100%;
  height: 50px;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  margin-top: 1%;
`;
const ModalButtonBtn = styled.TouchableOpacity`
  width: 20%;
  height: 100%;
`;

export default function AddingParticipamt() {
  const auth = getAuth();
  const [inputEmail, setInputEmail] = useState("");
  const [addingParticipantModal, setAddingParticipantModal] = useState(false);

  const verificationInputMail = async (email) => {
    try {
      const docSnap = await getDoc(doc(db, "users", email));
      if (docSnap.exists()) {
        addToParticipant(email);
      } else {
        Alert.alert("Participant doesn`t exict");
      }
    } catch (error) {
      Alert.alert("Participant doesn`t exict", error.message);
    }
  };
  const addToParticipant = async (email) => {
    console.log("auth", auth.currentUser.email);
    const currentEmail = auth.currentUser.email;
    try {
      const participant = {
        email: email,
      };
      await addDoc(collection(db, "AllParticipants", currentEmail, "PersonalParticipant"), participant);
      Alert.alert("You add new participant");
    } catch (error) {
      console.log("add to participant", error.message);
    }
  };

  return (
    <>
      {addingParticipantModal ? (
        <Modal>
          <ModalInput placeholder="Write email of participant" onChangeText={setInputEmail}></ModalInput>
          <ModalButton>
            <ModalButtonBtn
              onPress={() => {
                setAddingParticipantModal(false);
                setInputEmail("");
              }}
            >
              <Button children="Cancel" />
            </ModalButtonBtn>
            <ModalButtonBtn
              onPress={() => {
                verificationInputMail(inputEmail);
                setAddingParticipantModal(false);
                setInputEmail("");
              }}
            >
              <Button children="Check" />
            </ModalButtonBtn>
          </ModalButton>
        </Modal>
      ) : (
        <BlockAdding>
          <BlockIcon onPress={() => setAddingParticipantModal(true)}>
            <MaterialCommunityIcons name="account-plus-outline" size={80} color={colors.APBorderColor} />
          </BlockIcon>
        </BlockAdding>
      )}
    </>
  );
}
