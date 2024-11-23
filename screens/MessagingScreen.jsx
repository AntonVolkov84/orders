import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import * as colors from "../variables/colors";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import styled from "styled-components";
import { db, auth } from "../firebaseConfig";
import Button from "../components/Button";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import {
  doc,
  addDoc,
  onSnapshot,
  collection,
  orderBy,
  serverTimestamp,
  query,
  getDoc,
  getDocs,
  where,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import Message from "../components/Message";

const BlockButton = styled.View`
  width: 100%;
  height: 50px;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  margin-bottom: 3%;
  margin-top: 10%;
`;
const BlockButtonBtn = styled.TouchableOpacity`
  width: 33%;
  height: 100%;
`;
const BlockMessaging = styled.View`
  width: 100%;
  height: 70%;
`;
const BoxInput = styled.View`
  background-color: ${colors.MessagingInputBackground};
  padding: 3px;
  width: 99%;
  height: 50px;
  position: absolute;
  bottom: 10px;
  left: 6%;
  border-radius: 10px;
  flex-direction: row;
`;
const BoxInputText = styled.TextInput`
  padding: 10px;
  width: 90%;
  height: 100%;
  color: ${colors.MessagingInputColor};
  font-size: 20px;
`;
const BlockIconMessage = styled.TouchableOpacity`
  position: absolute;
  right: 5%;
  height: 100%;
  align-self: center;
  justify-content: center;
  align-items: center;
`;
const BlockForMessage = styled.View`
  width: 100%;
  height: fit-content;
  margin-bottom: 20px;
`;

export default function MessagingScreen({ route, navigation }) {
  const { item } = route.params;
  const [message, setMessage] = useState("");
  const [fetchedMessages, setFetchedMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const conversationId = item.docId;
  const currentUser = auth.currentUser;
  const flatList = React.useRef(null);
  const currentEmail = currentUser.email;
  const { t } = useTranslation();

  const markMessagesAsRead = async () => {
    const refForChangeMessageStatus = query(
      collection(db, "messages", conversationId, "conversation"),
      where("doNotReadBy", "array-contains", currentEmail)
    );
    const unreadMessages = await getDocs(refForChangeMessageStatus);
    const docForUpdate = [];
    unreadMessages.forEach(async (document) => {
      docForUpdate.push(document.id);
    });
    docForUpdate.forEach(async (id) => {
      const messageRef = doc(db, "messages", conversationId, "conversation", id);
      await updateDoc(messageRef, { doNotReadBy: arrayRemove(currentEmail) });
    });
  };

  const sendMessage = async () => {
    try {
      if (message.length) {
        const arrOfReciverMessage = item.participants.filter((email) => email !== currentEmail);
        const data = {
          messageId: Date.parse(new Date()),
          doNotReadBy: arrOfReciverMessage,
          messageText: message,
          author: currentUser.email,
          timestamp: serverTimestamp(),
        };
        await addDoc(collection(db, "messages", conversationId, "conversation"), data);
      }
      const arrOfReseiver = [];
      const participantsWithoutCurrentUser = item.participants.filter((email) => email !== currentUser.email);
      for (let i = 0; i < participantsWithoutCurrentUser.length; i++) {
        const docSnap = await getDoc(doc(db, "users", participantsWithoutCurrentUser[i]));
        arrOfReseiver.push(docSnap.data().pushToken);
      }
      try {
        const pushMessage = {
          to: arrOfReseiver,
          sound: "default",
          title: `Comment have arrived for ORDER by ${item.participants[0]}`,
          body: message,
        };
        await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            host: "exp.host",
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pushMessage),
        });
        setMessage("");
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log("send message", error);
    }
  };

  useEffect(() => {
    onSnapshot(
      query(collection(db, "messages", conversationId, "conversation"), orderBy("timestamp", "asc")),
      (snapshot) => {
        setFetchedMessages(
          snapshot.docs.map((doc) => ({
            ...doc.data(),
          }))
        );
        scrollToEnd();
        setLoaded(true);
      }
    );
    markMessagesAsRead();
  }, []);

  const scrollToEnd = () => {
    if (flatList.current) {
      flatList.current.scrollToEnd({ animated: true });
    }
  };

  return (
    <LinearGradient
      colors={[
        colors.startColorForGradient,
        colors.endColorForGradient,
        colors.startColorForGradient,
        colors.endColorForGradient,
      ]}
      start={{ x: 0.0, y: 0.0 }}
      end={{ x: 1.0, y: 1.0 }}
      style={{ height: "100%", width: "100%", paddingTop: "5%", paddingHorizontal: "5%" }}
    >
      <StatusBar style="light" />
      <BlockButton>
        <BlockButtonBtn
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Button children={t("MessagingGoBack")} />
        </BlockButtonBtn>
      </BlockButton>
      <BlockMessaging>
        {loaded ? (
          <BlockForMessage>
            <FlatList
              data={fetchedMessages}
              ref={flatList}
              renderItem={({ item }) => <Message message={item} />}
              keyExtractor={(item, index) => index}
            />
          </BlockForMessage>
        ) : (
          <Text style={{ color: colors.titleText, fontSize: 20 }}>Loading...</Text>
        )}
      </BlockMessaging>
      <BoxInput>
        <BoxInputText
          placeholderTextColor={colors.MessagingPlaceholder}
          placeholder={t("MessagingMakeMessage")}
          multiline
          onChangeText={setMessage}
          value={message}
        ></BoxInputText>
        <BlockIconMessage onPress={() => sendMessage()}>
          <FontAwesome name="send" size={20} color={colors.MessagingIconColor} />
        </BlockIconMessage>
      </BoxInput>
    </LinearGradient>
  );
}
