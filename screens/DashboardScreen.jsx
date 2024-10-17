import { View, Text } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components";
import * as colors from "../variables/colors";
import { getAuth, signOut } from "firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const LogOutButton = styled.TouchableOpacity`
  width: 200px;
  height: 100px;
  background-color: green;
  border-radius: 50px;
  margin: 0 auto;
  margin-top: 15%;
`;

const LogOutButtonText = styled.Text`
  color: ${colors.titleText};
  font-size: 25px;
`;

const auth = getAuth();

export default function DashboardScreen({ navigation }) {
  const logOut = () => {
    signOut(auth).catch((error) => {
      console.log(error);
    });
    GoogleSignin.revokeAccess();
    GoogleSignin.signOut();
  };
  console.log("Console User from dashboard", auth.currentUser);
  return (
    <LogOutButton
      onPress={() => {
        logOut();
      }}
    >
      <LinearGradient
        colors={[colors.buttonStartColorForGradient, colors.buttonEndColorForGradient]}
        start={{ x: 0.0, y: 0.0 }}
        end={{ x: 1.0, y: 1.0 }}
        style={{ height: "100%", width: "100%", justifyContent: "center", alignItems: "center", borderRadius: 50 }}
      >
        <LogOutButtonText>Log out</LogOutButtonText>
      </LinearGradient>
    </LogOutButton>
  );
}
