import { View, Alert, Text, Button, TouchableOpacity, TextInput } from "react-native";
import React, { useState, useEffect } from "react";
import { firebase } from "../firebaseConfig.js";
import styled from "styled-components";
import { getAuth, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import * as colors from "../variables/colors.js";

const TitleText = styled.Text`
  font-size: 50px;
  color: ${colors.titleText};
  display: block;
  margin: 0 auto;
  margin-top: 5%;
`;
const BlockInput = styled.View`
  width: 100%;
  margin-top: 10%;
`;
const InputField = styled.TextInput`
  width: 90%;
  height: 80px;
  margin-top: 5%;
  padding-left: 5%;
  margin-left: 5%;
  border-radius: 10px;
  background-color: ${colors.backgroundColorInput};
  border: none;
  color: ${colors.colorTextInput};
  font-size: 30px;
`;

const LoginButton = styled.TouchableOpacity`
  width: 200px;
  height: 100px;
  background-color: green;
  border-radius: 50px;
  margin: 0 auto;
  margin-top: 10%;
`;
const LoginButtonText = styled.Text`
  color: ${colors.titleText};
  font-size: 25px;
`;
const ButtonRegistration = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
  margin-top: 5%;
`;
const ButtonRegistrationText = styled.Text`
  font-size: 25px;
  color: ${colors.buttonRegistrationColor};
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
  const customNavigationBar = async () => {
    await NavigationBar.setBackgroundColorAsync("#1E2322");
    await NavigationBar.setButtonStyleAsync("light");
  };
  useEffect(() => {
    customNavigationBar();
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
      style={{ height: "100%", width: "100%", paddingTop: "5%" }}
    >
      <StatusBar style="light" />
      <TitleText>Login</TitleText>
      <BlockInput>
        <InputField
          inputMode={email}
          keyboardType={email}
          placeholder={"Type your email"}
          onChangeText={setEmail}
        ></InputField>
        <InputField secureTextEntry={true} placeholder={"Type your password"} onChangeText={setPassword}></InputField>
      </BlockInput>
      <LoginButton>
        <LinearGradient
          colors={[colors.buttonStartColorForGradient, colors.buttonEndColorForGradient]}
          start={{ x: 0.0, y: 0.0 }}
          end={{ x: 1.0, y: 1.0 }}
          style={{ height: "100%", width: "100%", justifyContent: "center", alignItems: "center", borderRadius: 50 }}
        >
          <LoginButtonText onPress={() => loginUser(email, password)}>Login</LoginButtonText>
        </LinearGradient>
      </LoginButton>
      <ButtonRegistration onPress={() => navigation.navigate("Registration")}>
        <ButtonRegistrationText>Registration</ButtonRegistrationText>
      </ButtonRegistration>
    </LinearGradient>
  );
}
