import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import * as colors from "../variables/colors";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import styled from "styled-components";
import { db, auth } from "../firebaseConfig";
import Button from "../components/Button";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { doc, addDoc, onSnapshot, collection, orderBy, serverTimestamp, query, where } from "firebase/firestore";
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
  height: 90%;
`;
const BoxInput = styled.View`
  background-color: ${colors.MessagingInputBackground};
  padding: 10px;
  width: 99%;
  height: 70px;
  position: absolute;
  bottom: 40px;
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
  top: 20%;
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

  const sendMessage = async () => {
    try {
      if (message.length) {
        const data = {
          messageId: Date.parse(new Date()),
          messageText: message,
          author: currentUser.email,
          timestamp: serverTimestamp(),
        };
        await addDoc(collection(db, "messages", conversationId, "conversation"), data);
        setMessage("");
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
        setLoaded(true);
      }
    );
  }, []);

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
          <Button children="Go back" />
        </BlockButtonBtn>
      </BlockButton>
      <BlockMessaging>
        {loaded ? (
          <BlockForMessage>
            <FlatList
              data={fetchedMessages}
              renderItem={({ item }) => <Message message={item} />}
              keyExtractor={(item, index) => index}
            />
          </BlockForMessage>
        ) : (
          <Text>Loading</Text>
        )}
      </BlockMessaging>
      <BoxInput>
        <BoxInputText
          placeholderTextColor={colors.MessagingPlaceholder}
          placeholder="Создать сообщение"
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
