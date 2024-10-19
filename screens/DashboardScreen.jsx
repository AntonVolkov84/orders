import { View, Text, Button, TouchableOpacity, Image, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components";
import * as colors from "../variables/colors";
import { getAuth, signOut } from "firebase/auth";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { db } from "../firebaseConfig";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { getDoc, doc, setDoc } from "firebase/firestore";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const BlockMenuProfile = styled.TouchableOpacity`
  width: 98%;
  height: 5%;
  background-color: ${colors.blockMenuProfile};
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-left: 1%;
`;
const BlockMenuProfileText = styled.Text`
  color: ${colors.blockMenuFrofileText};
  font-size: 30px;
  margin-left: 5%;
`;
const BlockProfile = styled.TouchableOpacity`
  width: 98%;
  height: 70%;
  position: absolute;
  background-color: ${colors.menuProfile};
  top: 10%;
  margin-left: 1%;
`;
const BlockProfileSectionNikname = styled.TouchableOpacity`
  width: 100%;
  height: 10%;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: ${colors.menuProfile};
`;
const BlockProfileSectionEmail = styled.TouchableOpacity`
  width: 100%;
  height: 10%;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: ${colors.menuProfile};
`;
const ChangeNikname = styled.TouchableOpacity`
  width: 10%;
  height: 100%;
  justify-content: center;
  align-items: center;
  margin-left: 5%;
`;
const ModalNikname = styled.View`
  width: 100%;
  height: 105%;
  position: absolute;
  z-index: 1;
  background-color: ${colors.modalNiknameBackground};
  padding-top: 30%;
  align-items: center;
`;
const ModalNiknameEntry = styled.View`
  width: 98%;
  height: 300px;
  border-radius: 10px;
  background-color: ${colors.modalNiknameBackgroundWindow};
  justify-content: center;
  align-items: center;
  gap: 40%;
`;
const ModalNiknameInput = styled.TextInput`
  width: 100%;
  height: 30%;
  background-color: ${colors.modalNiknameInput};
  padding-left: 5%;
  font-size: 40px;
`;
const ModalBlockBtn = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-around;
`;
const ModalNiknameBtnCancel = styled.TouchableOpacity`
  width: 15%;
  aspect-ratio: 4/3;
  border-radius: 18px;
  background-color: red;
  justify-content: center;
  align-items: center;
  margin-left: 5%;
`;
const ModalNiknameBtnOk = styled.TouchableOpacity`
  width: 15%;
  aspect-ratio: 4/3;
  border-radius: 18px;
  background-color: green;
  justify-content: center;
  align-items: center;
  margin-right: 5%;
`;
const ModalNiknameBtnText = styled.Text`
  color: ${colors.modalNiknameBtnText};
`;
const BlockProfileSectionAvatar = styled.TouchableOpacity`
  width: 100%;
  height: 68%;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: ${colors.menuProfile};
`;
const BlockProfileText = styled.Text`
  color: ${colors.menuFrofileText};
  font-size: 30px;
  margin-left: 5%;
`;

const auth = getAuth();

export default function DashboardScreen({ navigation }) {
  const [userProfileData, setUserProfileData] = useState(null);
  const [visibilityMenu, setVisibilityMenu] = useState(false);
  const [changeNiknameModal, setChangeNiknameModal] = useState(false);
  const [newNikname, setNewNikname] = useState("");
  const logOut = () => {
    signOut(auth).catch((error) => {
      console.log(error);
    });
    GoogleSignin.revokeAccess();
    GoogleSignin.signOut();
  };
  const customNavigationBar = async () => {
    await NavigationBar.setBackgroundColorAsync("#1E2322");
    await NavigationBar.setButtonStyleAsync("light");
  };
  const getUserProfile = async () => {
    const docRef = doc(db, "users", auth.currentUser.email);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserProfileData(docSnap.data());
    } else {
      console.log("Couldn`t download user profile");
    }
  };
  useEffect(() => {
    customNavigationBar();
    getUserProfile();
  }, []);

  const handleChangeNikname = async () => {
    const cityRef = doc(db, "users", auth.currentUser.email);
    await setDoc(cityRef, { nikname: newNikname }, { merge: true });
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
      <BlockMenuProfile onPress={() => setVisibilityMenu(!visibilityMenu)}>
        <MaterialCommunityIcons
          style={{ marginLeft: "5%" }}
          name="menu"
          size={40}
          color={colors.BlockMenuProfileText}
        />
        <BlockMenuProfileText>Proffile</BlockMenuProfileText>
      </BlockMenuProfile>
      {changeNiknameModal ? (
        <ModalNikname>
          <ModalNiknameEntry>
            <ModalNiknameInput
              onChangeText={setNewNikname}
              maxLength={20}
              placeholder="Print You`r nikname"
            ></ModalNiknameInput>
            <ModalBlockBtn>
              <ModalNiknameBtnCancel onPress={() => setChangeNiknameModal(false)}>
                <ModalNiknameBtnText>Cancel</ModalNiknameBtnText>
              </ModalNiknameBtnCancel>
              <ModalNiknameBtnOk
                onPress={() => {
                  handleChangeNikname();
                  setChangeNiknameModal(false);
                }}
              >
                <ModalNiknameBtnText>Ok</ModalNiknameBtnText>
              </ModalNiknameBtnOk>
            </ModalBlockBtn>
          </ModalNiknameEntry>
        </ModalNikname>
      ) : null}
      {visibilityMenu ? (
        <BlockProfile>
          <BlockProfileSectionEmail>
            <BlockProfileText>Email:</BlockProfileText>
            <BlockProfileText>{userProfileData.email}</BlockProfileText>
          </BlockProfileSectionEmail>
          <BlockProfileSectionNikname>
            <BlockProfileText>Nikname:</BlockProfileText>
            <BlockProfileText>{newNikname || userProfileData.nikname}</BlockProfileText>
            <ChangeNikname
              onPress={() => {
                setNewNikname("");
                setChangeNiknameModal(true);
              }}
            >
              <FontAwesome6 name="edit" size={40} color={colors.menuProfileText} />
            </ChangeNikname>
          </BlockProfileSectionNikname>
          <BlockProfileSectionAvatar>
            <Image
              style={{ width: "50%", aspectRatio: 1, objectfit: "cover", borderRadius: 180 }}
              source={{ uri: userProfileData.photoURL }}
            />
          </BlockProfileSectionAvatar>
          <Button
            onPress={() => {
              logOut();
            }}
            title="Logout"
          />
        </BlockProfile>
      ) : null}
    </LinearGradient>
  );
}
