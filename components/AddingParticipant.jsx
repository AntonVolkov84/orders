import { View, Text, TouchableOpacity, Alert, Image, TextInput, ScrollView, SafeAreaView } from "react-native";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as colors from "../variables/colors";
import { doc, addDoc, collection, getDoc, getDocs } from "firebase/firestore";
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
  height: 90%;
  aspect-ratio: 1;
  border: 2px solid;
  border-color: ${colors.APBorderColor};
  justify-content: center;
  align-items: center;
  border-radius: 100px;
  margin-right: 5%;
`;
const BlockParticipant = styled.TouchableOpacity`
  height: 80%;
  aspect-ratio: 1;
  justify-content: center;
  align-items: center;
  margin-right: 1%;
`;
const BlockParticipantAvatar = styled.Image`
  background-color: green;
  border-radius: 100px;
  aspect-ratio: 1;
  overflow: hidden;
  object-fit: cover;
  width: 80%;
`;
const BlockParticipantName = styled.Text`
  color: ${colors.APBorderColor};
  font-size: 24px;
  overflow: hidden;
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

export default function AddingParticipamt({ setParticipants, participants }) {
  const auth = getAuth();
  const [inputEmail, setInputEmail] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [allParticipantsData, setAllParticipantsData] = useState([]);
  const [addingParticipantModal, setAddingParticipantModal] = useState(false);

  const verificationInputMail = async (email) => {
    if (email === auth.currentUser.email) {
      return Alert.alert("Why You are adding Yourself. You are here!");
    }
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
    const currentEmail = auth.currentUser.email;
    try {
      const participant = {
        email: email,
      };
      await addDoc(collection(db, "AllParticipants", currentEmail, "PersonalParticipant"), participant);
      Alert.alert("You add new participant");
      gettAllParticipants();
    } catch (error) {
      console.log("add to participant", error.message);
    }
  };
  const gettAllParticipants = async () => {
    const currentEmail = auth.currentUser.email;
    try {
      const querySnapshot = await getDocs(collection(db, "AllParticipants", currentEmail, "PersonalParticipant"));
      const arr = querySnapshot.docs.map((doc) => doc.data().email);
      if (arr) {
        getdata(arr);
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  useEffect(() => {
    gettAllParticipants();
  }, []);

  const getdata = async (arr) => {
    const newArr = [];
    for (i = 0; i < arr.length; i++) {
      const docSnap = await getDoc(doc(db, "users", arr[i]));
      newArr.push(docSnap.data());
      if (i === arr.length - 1) {
        setAllParticipantsData(newArr);
        setLoadingData(false);
      }
    }
  };
  const addParticipantsToOrder = (participant) => {
    const dublicate = participants.some((e) => e.email === participant.email);
    if (!dublicate) {
      setParticipants((prevParticipants) => [...prevParticipants, { ...participant }]);
    }
  };
  return (
    <>
      {addingParticipantModal ? (
        <Modal>
          <ModalInput
            placeholder="Write email of participant"
            value={inputEmail}
            onChangeText={setInputEmail}
          ></ModalInput>
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
        <SafeAreaView>
          <ScrollView horizontal={true}>
            <BlockAdding>
              <BlockIcon onPress={() => setAddingParticipantModal(true)}>
                <MaterialCommunityIcons name="account-plus-outline" size={80} color={colors.APBorderColor} />
              </BlockIcon>
              {loadingData ? (
                <Text style={{ color: colors.titleText, fontSize: 25 }}>Loading...</Text>
              ) : (
                <>
                  {allParticipantsData.map((participant) => (
                    <BlockParticipant onPress={() => addParticipantsToOrder(participant)} key={participant.userId}>
                      <BlockParticipantAvatar
                        source={{
                          uri: `${participant.photoURL}`,
                        }}
                      ></BlockParticipantAvatar>
                      <BlockParticipantName>{participant.nikname}</BlockParticipantName>
                    </BlockParticipant>
                  ))}
                </>
              )}
            </BlockAdding>
          </ScrollView>
        </SafeAreaView>
      )}
    </>
  );
}
