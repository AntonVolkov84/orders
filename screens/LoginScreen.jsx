import { View, Text, Button, TouchableOpacity, TextInput } from "react-native";
import React, { useState } from "react";
import { firebase } from "../firebaseConfig.js";
import styled from "styled-components";

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

  const loginUser = async (email, password) => {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.log("Error in LoginUser", error);
    }
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
