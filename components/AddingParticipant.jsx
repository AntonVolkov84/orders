import { View, Text, TouchableOpacity, Alert, Image, TextInput, ScrollView, FlatList } from "react-native";
import React, { useState, useEffect, memo } from "react";
import styled from "styled-components";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as colors from "../variables/colors";
import { doc, addDoc, collection, getDoc, getDocs, where, query, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Button from "./Button";
import { db } from "../firebaseConfig";
import { useTranslation } from "react-i18next";
import { Dimensions } from "react-native";
import ModalAddingParticipant from "./ModalAddingParticipant";

const screenHeight = Dimensions.get("screen").height;

const Repair = styled.ScrollView`
  width: 100%;
  flex-direction: row;
`;
const BlockIcon = styled.TouchableOpacity`
  height: 70px;
  width: 70px;
  border: 2px solid;
  border-color: ${colors.APBorderColor};
  justify-self: center;
  align-self: center;
  border-radius: 100px;
  margin-right: 1%;
  justify-content: center;
  align-items: center;
`;
const BlockParticipant = styled.TouchableOpacity`
  height: 100%;
  justify-content: center;
  width: 60px;
`;
const BlockParticipantAvatar = styled.Image`
  border-radius: 100px;
  aspect-ratio: 1;
  object-fit: cover;
`;
const BlockParticipantName = styled.Text`
  color: ${colors.APBorderColor};
  font-size: 12px;
  width: 100%;
  height: 20px;
  text-overflow: ellipsis;
  text-align: center;
`;

const ModalDelParticipant = styled.View`
  width: 100%;
  height: 100%;
  padding: 2%;
  background-color: ${colors.orderBackgroundColor};
  position: absolute;
  z-index: 5;
`;
const ModalDelParticipantText = styled.Text`
  width: 100%;
  padding: 2%;
  background-color: ${colors.orderBackgroundColor};
  color: ${colors.titleText};
  text-align: center;
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
const BlockNoOne = styled.View`
  flex-direction: row;
`;
const BlockNoOneIcon = styled.TouchableOpacity`
  width: 70px;
  height: 70px;
  border: 2px solid;
  border-color: ${colors.APBorderColor};
  justify-self: center;
  align-self: center;
  border-radius: 100px;
  margin-right: 1%;
  justify-content: center;
  align-items: center;
`;

export default memo(function AddingParticipant({ setParticipants, participants, updateParticipants }) {
  const auth = getAuth();
  const [loadingData, setLoadingData] = useState(true);
  const [allParticipantsData, setAllParticipantsData] = useState([]);
  const [addingParticipantModal, setAddingParticipantModal] = useState(false);
  const [noOneParticipant, setNoOneParticipant] = useState(true);
  const [delParticipantModal, setDelParticipantModal] = useState(false);
  const [participantForDeleting, setParticipantForDeleting] = useState("");
  const { t } = useTranslation();

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
    try {
      const promises = arr.map((id) => getDoc(doc(db, "users", id)));
      const docs = await Promise.all(promises);

      const newArr = docs.filter((docSnap) => docSnap.exists()).map((docSnap) => docSnap.data());

      setAllParticipantsData(newArr);
    } catch (err) {
      console.log("Ошибка при загрузке данных участников:", err.message);
    } finally {
      setLoadingData(false);
    }
  };
  const addParticipantsToOrder = (participant) => {
    const dublicate = participants.some((e) => e.email === participant.email);
    if (!dublicate) {
      setParticipants((prevParticipants) => [...prevParticipants, { ...participant }]);
    }
  };
  const handleLongPress = (participant) => {
    setDelParticipantModal(true);
    setParticipantForDeleting(participant.email);
  };
  const delParticipantData = async (participant) => {
    let documentID;
    const ref = query(
      collection(db, "AllParticipants", auth.currentUser.email, "PersonalParticipant"),
      where("email", "==", `${participant}`)
    );
    const dataForDel = await getDocs(ref);
    dataForDel.forEach(async (e) => {
      documentID = e.id;
      await deleteDoc(doc(db, "AllParticipants", auth.currentUser.email, "PersonalParticipant", documentID));
    });
    gettAllParticipants();
  };

  return (
    <>
      {delParticipantModal ? (
        <ModalDelParticipant>
          <ModalDelParticipantText>
            {t("AddingParticipantsAskDelParticipant")} {participantForDeleting}
          </ModalDelParticipantText>
          <ModalButton>
            <ModalButtonBtn
              onPress={() => {
                setDelParticipantModal(false);
              }}
            >
              <Button children={t("ProffileCancel")} />
            </ModalButtonBtn>
            <ModalButtonBtn
              onPress={() => {
                setDelParticipantModal(false);
                delParticipantData(participantForDeleting);
                setParticipantForDeleting("");
              }}
            >
              <Button children={t("AddingParticipantsDel")} />
            </ModalButtonBtn>
          </ModalButton>
        </ModalDelParticipant>
      ) : null}
      {addingParticipantModal ? (
        <ModalAddingParticipant
          gettAllParticipants={gettAllParticipants}
          setAddingParticipantModal={setAddingParticipantModal}
        />
      ) : loadingData ? (
        <BlockNoOne>
          <BlockNoOneIcon onPress={() => setAddingParticipantModal(true)}>
            <MaterialCommunityIcons
              name="account-plus-outline"
              size={screenHeight < 760 ? 30 : 40}
              color={colors.APBorderColor}
            />
          </BlockNoOneIcon>
          {noOneParticipant ? (
            <Text
              style={{
                color: colors.titleText,
                fontSize: 20,
              }}
            >
              {t("AddingParticipantsNoOne")}
            </Text>
          ) : (
            <Text style={{ textAlign: "center", textJustify: "center", color: colors.titleText, fontSize: 20 }}>
              Loading...
            </Text>
          )}
        </BlockNoOne>
      ) : (
        <Repair horizontal showsHorizontalScrollIndicator={false}>
          <BlockIcon
            accessibilityLabel="Button view modal window for adding participant to global list"
            accessible={true}
            onPress={() => setAddingParticipantModal(true)}
          >
            <MaterialCommunityIcons
              name="account-plus-outline"
              size={screenHeight < 760 ? 30 : 40}
              color={colors.APBorderColor}
            />
          </BlockIcon>
          {allParticipantsData.map((p, index) => {
            return (
              <BlockParticipant
                accessibilityLabel={`Participant: ${p.nikname}`}
                accessible={true}
                key={p.id || index}
                onPress={() => (updateParticipants ?? addParticipantsToOrder)(p)}
                onLongPress={() => handleLongPress(p)}
                style={{ marginRight: 10 }}
              >
                <BlockParticipantAvatar
                  source={{
                    uri: `${p.photoURL}`,
                  }}
                ></BlockParticipantAvatar>
                <BlockParticipantName numberOfLines={1}>{p.nikname || "No nikname"}</BlockParticipantName>
              </BlockParticipant>
            );
          })}
        </Repair>
      )}
    </>
  );
});
