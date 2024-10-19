import { View, Alert, Text, Button, TouchableOpacity, TextInput } from "react-native";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { getAuth, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import * as colors from "../variables/colors.js";
import { GoogleSignin, GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { db } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

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
const ButtonGoogle = styled.TouchableOpacity`
  width: 250px;
  height: 80px;
  border-radius: 50px;
  margin: 5% auto;
  font-size: 20px;
  border-radius: 15px;
`;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = getAuth();
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

  const addToUsers = async (nikname, photoURL, email, userId) => {
    try {
      const user = {
        timestamp: serverTimestamp(),
        nikname: nikname,
        photoURL: photoURL,
        email: email,
        userId: userId,
      };
      await setDoc(doc(db, "users", email), user);
    } catch (error) {
      console.log("add to users", error);
    }
  };

  const customNavigationBar = async () => {
    await NavigationBar.setBackgroundColorAsync("#1E2322");
    await NavigationBar.setButtonStyleAsync("light");
  };
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "604190082036-2hogegaj8kj52vmqj0uo975d3hfgklg5.apps.googleusercontent.com",
    });
    customNavigationBar();
  }, []);

  const signin = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const user = await GoogleSignin.signIn();
      const idToken = user.data.idToken;
      const googleCredential = GoogleAuthProvider.credential(idToken);
      signInWithCredential(auth, googleCredential).then((result) => {
        const currentUser = result.user;
        const nikname = result._tokenResponse.firstName;
        const photoURL = currentUser.photoURL;
        const email = currentUser.email;
        const userId = currentUser.uid;
        addToUsers(nikname, photoURL, email, userId);
      });
    } catch (error) {
      console.log("signin", error);
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
      <ButtonGoogle>
        <GoogleSigninButton
          style={{
            justifySelf: "center",
            alignSelf: "center",
            marginTop: "10%",
            width: "100%",
            height: "100%",
          }}
          onPress={() => signin()}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
        />
      </ButtonGoogle>
      <ButtonRegistration onPress={() => navigation.navigate("Registration")}>
        <ButtonRegistrationText>Registration</ButtonRegistrationText>
      </ButtonRegistration>
    </LinearGradient>
  );
}
