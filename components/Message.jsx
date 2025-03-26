import { View, Text, Image, TouchableOpacity, TextInput } from "react-native";
import React, { useState, useEffect, memo } from "react";
import styled from "styled-components";
import { doc, onSnapshot, deleteDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import * as colors from "../variables/colors";
import { Dimensions } from "react-native";
import { useTranslation } from "react-i18next";
import Entypo from "@expo/vector-icons/Entypo";

const screenHeight = Dimensions.get("screen").height;

const BlockMessage = styled.TouchableOpacity`
  width: 70%;
  height: fit-content;
  padding-top: 5px;
  padding-right: 5px;
  border-radius: 5px;
  flex-direction: row;
  margin-top: 5px;
`;
const BlockForMessageAuthor = styled.View`
  width: 18%;
  height: fit-content;
  justify-content: start;
  align-items: center;
  margin-top: 3px;
`;
const AuthorAvatar = styled.Image`
  width: 70%;
  border-radius: 50px;
  aspect-ratio: 1;
`;
const AuthorName = styled.Text`
  font-size: 10px;
  color: ${colors.titleText};
`;
const BlockForMessageText = styled.Text`
  width: ${screenHeight < 760 ? "170px" : "200px"};
  color: white;
  font-size: ${screenHeight < 760 ? "10px" : "15px"};
`;
const Modal = styled.View`
  width: 70%;
  height: fit-content;
  padding: 5px;
  border-radius: 5px;
  margin-top: 5px;
  margin-left: 30%;
  background-color: ${colors.MessageBackgroundColorWithAuthor};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
const ModalInputView = styled.View`
  width: 70%;
  height: fit-content;
  padding: 5px;
  border-radius: 5px;
  margin-top: 5px;
  margin-left: 30%;
  background-color: ${colors.MessageBackgroundColorWithAuthor};
  display: flex;
  flex-direction: row;
`;
const ModalInput = styled.TextInput`
  width: 85%;
  color: black;
`;
const ModalInputIcon = styled.TouchableOpacity`
  width: 14%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: start;
  background-color: ${colors.MessageIconUpdateMessageBackground};
  margin-left: 3px;
  border-radius: 5px;
`;
const ModalBtn = styled.TouchableOpacity`
  width: 70px;
  height: 30px;
  background-color: ${colors.MessageBackgroundColor};
  border-radius: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const ModalBtnText = styled.Text`
  font-size: ${screenHeight < 760 ? "8px" : "12px"};
  text-align: center;
  color: white;
`;

export default memo(function Message({ message, setMessageUpdate }) {
  const [loaded, setLoaded] = useState(false);
  const [author, setAuthor] = useState(null);
  const [messageText, setMessageText] = useState(message.messageText || null);
  const [modalMessage, setModalMessage] = useState(false);
  const [modalUpdateMessage, setUpdateModalMessage] = useState(false);
  const messageAuthor = message.author;
  const currentUser = auth.currentUser;
  const email = currentUser.email;
  const isValide = email === messageAuthor;
  const { t } = useTranslation();

  const deleteMessage = async () => {
    try {
      await deleteDoc(doc(db, "messages", message.parentId, "conversation", message.docId));
    } catch (error) {
      console.log("deleteMessage", error.message);
    }
  };

  useEffect(() => {
    onSnapshot(doc(db, "users", messageAuthor), (snapshot) => {
      setAuthor(snapshot.data());
      setLoaded(true);
    });
  }, []);

  return (
    <>
      {loaded ? (
        <>
          {modalMessage && isValide ? (
            <Modal>
              <ModalBtn onPress={() => setModalMessage(false)}>
                <ModalBtnText>{t("ProffileCancel")}</ModalBtnText>
              </ModalBtn>
              <ModalBtn
                onPress={() => {
                  setMessageUpdate({
                    messageText: message.messageText,
                    parentId: message.parentId,
                    docId: message.docId,
                  });
                  setModalMessage(false);
                }}
              >
                <ModalBtnText>{t("messageModalUpdate")}</ModalBtnText>
              </ModalBtn>
              <ModalBtn>
                <ModalBtnText
                  onPress={() => {
                    deleteMessage();
                    setModalMessage(false);
                  }}
                >
                  {t("messageModalDelete")}
                </ModalBtnText>
              </ModalBtn>
            </Modal>
          ) : (
            <BlockMessage
              onLongPress={() => setModalMessage(true)}
              accessibilityLabel={`Message: ${message.messageText}`}
              accessible={true}
              style={{
                backgroundColor: isValide ? colors.MessageBackgroundColorWithAuthor : colors.MessageBackgroundColor,
                flexDirection: isValide ? "row-reverse" : "row",
                marginLeft: isValide ? "30%" : "0",
              }}
            >
              <BlockForMessageAuthor>
                <AuthorAvatar source={{ uri: author.photoURL }}></AuthorAvatar>
                <AuthorName>{author.nikname}</AuthorName>
              </BlockForMessageAuthor>
              <BlockForMessageText style={{ textAlign: "start" }}>{message.messageText}</BlockForMessageText>
            </BlockMessage>
          )}
        </>
      ) : null}
    </>
  );
});
