import { View, Alert, Text, TextInput, TouchableOpacity, Image, Button } from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as colors from "../variables/colors";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import styled from "styled-components";
import { db } from "../firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, signOut, sendEmailVerification, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { AppContext } from "../App.js";
import { Dimensions } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const screenHeight = Dimensions.get("screen").height;

const TitleText = styled.Text`
  font-size: ${screenHeight < 760 ? "30px" : "40px"};
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
  width: 80%;
  height: ${screenHeight < 760 ? "50px" : "70px"};
  margin-top: 5%;
  padding-left: 5%;
  margin-left: 10%;
  border-radius: 10px;
  background-color: ${colors.backgroundColorInput};
  border: none;
  color: ${colors.colorTextInput};
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
`;
const InputFieldPassword = styled.TextInput`
  width: 100%;
  height: ${screenHeight < 760 ? "50px" : "70px"};
  border-radius: 10px;
  background-color: ${colors.backgroundColorInput};
  border: none;
  color: ${colors.colorTextInput};
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
`;
const InputFieldPasswordBlock = styled.View`
  width: 80%;
  height: ${screenHeight < 760 ? "50px" : "70px"};
  margin-top: 5%;
  padding-left: 5%;
  margin-left: 10%;
  border-radius: 10px;
  background-color: ${colors.backgroundColorInput};
  border: none;
  color: ${colors.colorTextInput};
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
  position: relative;
`;
const Eye = styled.TouchableOpacity`
  position: absolute;
  right: 5px;
  top: ${screenHeight < 760 ? "10px" : "20px"};
  justify-content: center;
  align-items: center;
`;
const RegisterButton = styled.TouchableOpacity`
  width: 160px;
  height: ${screenHeight < 760 ? "50px" : "70px"};
  border-radius: 50px;
  margin: 0 auto;
  margin-top: 15%;
`;
const RegisterButtonText = styled.Text`
  color: ${colors.buttonRegistrationColor};
  font-size: ${screenHeight < 760 ? "15px" : "20px"};
`;

export default function RegistrationScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nikname, setNikname] = useState("");
  const [secureText, setSecureText] = useState(true);
  const auth = getAuth();
  const expoPushToken = useContext(AppContext);

  const addToUsers = async (userId) => {
    const emailInLowerCase = email.toLowerCase();
    try {
      const user = {
        language: "en",
        timestamp: serverTimestamp(),
        nikname: nikname,
        photoURL:
          "https://firebasestorage.googleapis.com/v0/b/orders-78c1c.appspot.com/o/avatar%2FComponent%203.png?alt=media&token=9365bf71-bcfd-44d3-adb5-28bdbf7e0bf4",
        email: emailInLowerCase,
        userId: userId,
        file: "",
        pushToken: expoPushToken,
      };
      await setDoc(doc(db, "users", emailInLowerCase), user);
    } catch (error) {
      console.log("add to users", error);
    }
  };

  const handleRegister = (email, password) => {
    if (password.length < 6) {
      return Alert.alert("Your password should be no less then 6 symbols");
    }
    if (nikname.length < 1) {
      return Alert.alert("Your nikname should be no less then 1 symbols");
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const userId = user.uid;
        if (user.uid) {
          addToUsers(userId);
          sendEmailVerification(auth.currentUser).then(() => {
            Alert.alert("You may recived a mail with link for authorization");
          });
          signOut(auth);
          navigation.navigate("Login");
        }
      })
      .catch((error) => {
        console.log("handleRegistre", error);
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
      <TitleText>Registration</TitleText>
      <BlockInput>
        <InputField
          inputMode={email}
          keyboardType={email}
          placeholder={"Type your email"}
          onChangeText={setEmail}
        ></InputField>
        <InputFieldPasswordBlock>
          <InputFieldPassword
            secureTextEntry={secureText}
            placeholder={"Type your password"}
            onChangeText={setPassword}
          ></InputFieldPassword>
          {secureText ? (
            <Eye onPress={() => setSecureText(false)}>
              <FontAwesome6 name="eye" size={screenHeight < 760 ? 15 : 28} color={colors.placeolderColor} />
            </Eye>
          ) : (
            <Eye onPress={() => setSecureText(true)}>
              <FontAwesome6 name="eye-slash" size={screenHeight < 760 ? 15 : 28} color={colors.placeolderColor} />
            </Eye>
          )}
        </InputFieldPasswordBlock>
        <InputField placeholder={"Type your Nikname"} onChangeText={setNikname}></InputField>
      </BlockInput>

      <RegisterButton onPress={() => handleRegister(email, password)}>
        <LinearGradient
          colors={[colors.buttonStartColorForGradient, colors.buttonEndColorForGradient]}
          start={{ x: 0.0, y: 0.0 }}
          end={{ x: 1.0, y: 1.0 }}
          style={{ height: "100%", width: "100%", justifyContent: "center", alignItems: "center", borderRadius: 50 }}
        >
          <RegisterButtonText>Registration</RegisterButtonText>
        </LinearGradient>
      </RegisterButton>
    </LinearGradient>
  );
}
