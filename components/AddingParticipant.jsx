import { View, Text, TouchableOpacity, Alert, Image, TextInput, ScrollView, SafeAreaView } from "react-native";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as colors from "../variables/colors";
import { doc, addDoc, collection, getDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Button from "./Button";
import { db } from "../firebaseConfig";

const BlockSaveArea = styled.SafeAreaView`
  width: 100%;
  height: 100%;
`;
const BlockAdding = styled.View`
  width: 100%;
  height: 100%;
  flex-direction: row;
  align-items: center;
`;
const BlockIcon = styled.TouchableOpacity`
  height: 75px;
  width: 75px;
  border: 2px solid;
  border-color: ${colors.APBorderColor};
  justify-self: center;
  align-self: center;
  border-radius: 100px;
  margin-right: 5%;
  justify-content: center;
  align-items: center;
`;
const BlockParticipant = styled.TouchableOpacity`
  width: 60px;
  justify-content: center;
  align-items: center;
  margin-right: 1%;
`;
const BlockParticipantAvatar = styled.Image`
  border-radius: 100px;
  aspect-ratio: 1;
  object-fit: cover;
  width: 100%;
`;
const BlockParticipantName = styled.Text`
  color: ${colors.APBorderColor};
  font-size: 12px;
  width: 100%;
  height: 20px;
  text-overflow: ellipsis;
  text-align: center;
`;
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

export default function AddingParticipant({ setParticipants, participants }) {
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
        <BlockSaveArea>
          <ScrollView style={{ width: "100%", height: "100%" }} horizontal={true}>
            <BlockAdding>
              <BlockIcon onPress={() => setAddingParticipantModal(true)}>
                <MaterialCommunityIcons name="account-plus-outline" size={50} color={colors.APBorderColor} />
              </BlockIcon>
              {loadingData ? (
                <Text style={{ textAlign: "center", textJustify: "center", color: colors.titleText, fontSize: 20 }}>
                  Loading...
                </Text>
              ) : (
                <>
                  {allParticipantsData.map((participant, index) => (
                    <View key={index}>
                      {participant ? (
                        <BlockParticipant onPress={() => addParticipantsToOrder(participant)}>
                          <BlockParticipantAvatar
                            source={{
                              uri: `${participant.photoURL}`,
                            }}
                          ></BlockParticipantAvatar>
                          <BlockParticipantName numberOfLines={1}>
                            {participant.nikname || "No nikname"}
                          </BlockParticipantName>
                        </BlockParticipant>
                      ) : (
                        <Text style={{ color: colors.titleText, width: "30%", textAlign: "center" }}>
                          Participant delete
                        </Text>
                      )}
                    </View>
                  ))}
                </>
              )}
            </BlockAdding>
          </ScrollView>
        </BlockSaveArea>
      )}
    </>
  );
}
