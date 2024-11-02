import { View, Alert, Text, TextInput, TouchableOpacity, Image, Button } from "react-native";
import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as colors from "../variables/colors";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import styled from "styled-components";
import { getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { db, app } from "../firebaseConfig";
import { collection, doc, addDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, signOut, sendEmailVerification, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

const TitleText = styled.Text`
  font-size: 40px;
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
  height: 70px;
  margin-top: 5%;
  padding-left: 5%;
  margin-left: 10%;
  border-radius: 10px;
  background-color: ${colors.backgroundColorInput};
  border: none;
  color: ${colors.colorTextInput};
  font-size: 25px;
`;
const AvatarBlock = styled.TouchableOpacity`
  width: 160px;
  height: 160px;
  align-self: center;
  margin-top: 15%;
  justify-content: center;
`;
const AvatarText = styled.Text`
  font-size: 25px;
  text-align: center;
  color: ${colors.colorTextInput};
`;
const RegisterButton = styled.TouchableOpacity`
  width: 160px;
  height: 70px;
  background-color: green;
  border-radius: 50px;
  margin: 0 auto;
  margin-top: 15%;
`;
const RegisterButtonText = styled.Text`
  color: ${colors.buttonRegistrationColor};
  font-size: 20px;
`;

export default function RegistrationScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [nikname, setNikname] = useState("");
  const [fileName, setFileName] = useState("");
  const storage = getStorage(app);
  const auth = getAuth();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    });
    if (result) {
      setFileName(result.assets[0].fileName);
      const storageRef = ref(storage, `avatar/${result.assets[0].fileName}`);
      const uriForStorage = result.assets[0].uri;
      addToFirebaseStorage(storageRef, uriForStorage);
    }
  };

  const addToFirebaseStorage = async (storageRef, uriForStorage) => {
    try {
      const response = await fetch(uriForStorage);
      if (!response) {
        console.log("Failed to fetch file");
      }
      const mediaBlob = await response.blob();
      const uploadToStorage = uploadBytesResumable(storageRef, mediaBlob);

      uploadToStorage.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          console.log(error);
        },
        () => {
          getDownloadURL(uploadToStorage.snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);
            setPhotoURL(downloadURL);
          });
        }
      );
    } catch (error) {
      console.log(error);
    }
  };
  const addToUsers = async (userId) => {
    try {
      const user = {
        timestamp: serverTimestamp(),
        nikname: nikname,
        photoURL: photoURL,
        email: email,
        userId: userId,
        file: fileName,
      };
      await setDoc(doc(db, "users", email), user);
    } catch (error) {
      console.log("add to users", error);
    }
  };

  const handleRegister = (email, password) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const userId = user.uid;
        if (user.uid) {
          updateProfile(auth.currentUser, { photoURL: photoURL });
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
        <InputField secureTextEntry={true} placeholder={"Type your password"} onChangeText={setPassword}></InputField>
        <InputField placeholder={"Type your Nikname"} onChangeText={setNikname}></InputField>
      </BlockInput>
      <AvatarBlock onPress={pickImage}>
        <LinearGradient
          colors={[colors.backgrountAvatarStartColoForGradient, colors.backgrountAvatarEndColoForGradient]}
          start={{ x: 0.0, y: 0.0 }}
          end={{ x: 1.0, y: 1.0 }}
          style={{
            height: "100%",
            width: "100%",
            borderRadius: 100,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {photoURL ? (
            <Image
              style={{ width: "100%", height: "100%", objectfit: "cover", borderRadius: 100 }}
              source={{ uri: photoURL }}
            ></Image>
          ) : (
            <AvatarText>Add avatar</AvatarText>
          )}
        </LinearGradient>
      </AvatarBlock>

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
