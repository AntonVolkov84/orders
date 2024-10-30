import { View, Text, Image } from "react-native";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { doc, addDoc, onSnapshot, collection, orderBy, serverTimestamp, query, where } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import * as colors from "../variables/colors";

const BlockMessage = styled.View`
  width: 100%;
  height: fit-content;
  flex-direction: row;
`;
const BlockForMessageAuthor = styled.View`
  width: 25%;
  height: fit-content;
  justify-content: start;
  align-items: center;
`;
const AuthorAvatar = styled.Image`
  width: 60%;
  border-radius: 50px;
  aspect-ratio: 1;
`;
const AuthorName = styled.Text`
  font-size: 20px;
  color: ${colors.titleText};
`;
const BlockForMessageText = styled.Text`
  width: 280px;
  color: white;
  font-size: 30px;
`;

export default function Message({ message }) {
  const [loaded, setLoaded] = useState(false);
  const [author, setAuthor] = useState(null);
  const messageAuthor = message.author;
  const currentUser = auth.currentUser;
  const email = currentUser.email;
  const isValide = email === messageAuthor;
  useEffect(() => {
    onSnapshot(doc(db, "users", messageAuthor), (snapshot) => {
      setAuthor(snapshot.data());
      setLoaded(true);
    });
  }, []);

  return (
    <>
      {loaded ? (
        <BlockMessage
          style={{
            flexDirection: isValide ? "row-reverse" : "row",
          }}
        >
          <BlockForMessageAuthor>
            <AuthorAvatar source={{ uri: author.photoURL }}></AuthorAvatar>
            <AuthorName>{author.nikname}</AuthorName>
          </BlockForMessageAuthor>
          <BlockForMessageText style={{ textAlign: isValide ? "right" : "start" }}>
            {message.messageText}
          </BlockForMessageText>
        </BlockMessage>
      ) : null}
    </>
  );
}