import { View, Alert, Text, Button, TouchableOpacity, TextInput } from "react-native";
import React, { useState } from "react";
import { firebase } from "../firebaseConfig.js";
import styled from "styled-components";
import { getAuth, signOut, signInWithEmailAndPassword } from "firebase/auth";

const BlockButton = styled.TouchableOpacity`
  width: 50px;
  height: 50px;
  background-color: grey;
  margin-top: 5%;
`;
const BlockInput = styled.TextInput`
  width: 100%;
  height: 50px;
  background-color: green;
  margin-top: 5%;
`;
const BlockButtonText = styled.Text`
  color: red;
`;
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = getAuth();
  const logOut = () => {
    signOut(auth).catch((error) => {
      console.log(error);
    });
  };
  const loginUser = () => {
    signInWithEmailAndPassword(auth, email, password)
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("error in loginUser", errorCode, errorMessage);
      })
      .then(() => {
        if (!auth.currentUser.emailVerified) {
          Alert.alert("Mail is not Verified");
          logOut();
        }
      });
  };
  return (
    <View>
      <Text>LoginScreen</Text>
      <Button title={"to registration"} onPress={() => navigation.navigate("Registration")}></Button>
      <BlockInput placeholder={"email"} onChangeText={setEmail}></BlockInput>
      <BlockInput placeholder={"password"} secureTextEntry={true} onChangeText={setPassword}></BlockInput>
      <BlockButton>
        <BlockButtonText onPress={() => loginUser(email, password)}>Залогинится</BlockButtonText>
      </BlockButton>
    </View>
  );
}
