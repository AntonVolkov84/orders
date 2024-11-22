import { View, Text, Button, TouchableOpacity, Image, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import * as colors from "../variables/colors";
import { getAuth, signOut } from "firebase/auth";
import * as NavigationBar from "expo-navigation-bar";
import { db, app } from "../firebaseConfig";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { getDoc, doc, setDoc, onSnapshot } from "firebase/firestore";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, getStorage, ref, uploadBytesResumable, deleteObject } from "firebase/storage";

const BlockMenuProfile = styled.TouchableOpacity`
  width: 98%;
  height: 7%;
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
  height: 90%;
  position: absolute;
  margin-top: 3%;
  background-color: ${colors.menuProfile};
  top: 11%;
  margin-left: 1%;
  z-index: 2;
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
  width: 90%;
  height: 10%;
  margin-left: 5%;
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
  z-index: 3;
`;
const ModalNiknameEntry = styled.View`
  width: 98%;
  height: 250px;
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
  font-size: 25px;
`;
const ModalBlockBtn = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-around;
`;
const ModalNiknameBtnCancel = styled.TouchableOpacity`
  width: 20%;
  aspect-ratio: 4/3;
  border-radius: 18px;
  background-color: red;
  justify-content: center;
  align-items: center;
  margin-left: 5%;
`;
const ModalNiknameBtnOk = styled.TouchableOpacity`
  width: 20%;
  aspect-ratio: 4/3;
  border-radius: 18px;
  background-color: green;
  justify-content: center;
  align-items: center;
  margin-right: 5%;
`;
const ModalNiknameBtnText = styled.Text`
  color: ${colors.modalNiknameBtnText};
  font-size: 20px;
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
  font-size: 20px;
  margin-left: 5%;
`;
const ButtonLogout = styled.TouchableOpacity`
  width: 100%;
  height: 7%;
  background-color: ${colors.backgroundLogoutBtn};
  justify-content: center;
  align-items: center;
`;
const ButtonLogoutText = styled.Text`
  color: ${colors.titleText};
  font-size: 25px;
`;
const auth = getAuth();

export default function DashboardScreen({ navigation }) {
  const [userProfileData, setUserProfileData] = useState(null);
  const [loadingUserProfileData, setLoadingUserProfileData] = useState(true);
  const [visibilityMenu, setVisibilityMenu] = useState(false);
  const [changeNiknameModal, setChangeNiknameModal] = useState(false);
  const [newNikname, setNewNikname] = useState("");
  const [newPhotoURL, setNewPhotoURL] = useState(null);
  const [fileName, setFileName] = useState(null);
  const storage = getStorage(app);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    });
    if (result) {
      const fileToDel = result.assets[0].fileName;
      setFileName(fileToDel);
      const storageRef = ref(storage, `avatar/${result.assets[0].fileName}`);
      const uriForStorage = result.assets[0].uri;
      addToFirebaseStorage(storageRef, uriForStorage, fileToDel);
    }
  };

  const delFileFromStorage = async () => {
    if (!userProfileData.file && !fileName) {
      return;
    }
    const desertRef = ref(storage, `avatar/${userProfileData.file || fileName}`);
    deleteObject(desertRef)
      .then(() => {
        console.log("File delete!");
      })
      .catch((error) => {
        console.log("del file from storage", error);
      });
  };

  const addToFirebaseStorage = async (storageRef, uriForStorage, fileToDel) => {
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
            setNewPhotoURL(downloadURL);
            handleChangeAvatar(fileToDel, downloadURL);
          });
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

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
      setLoadingUserProfileData(false);
    } else {
      console.log("Couldn`t download user profile");
    }
  };
  useEffect(() => {
    onSnapshot(doc(db, "users", auth.currentUser.email), (snapshot) => {
      setUserProfileData(snapshot.data());
    });
    setLoadingUserProfileData(false);
    customNavigationBar();
  }, []);

  const handleChangeNikname = async () => {
    const cityRef = doc(db, "users", auth.currentUser.email);
    await setDoc(cityRef, { nikname: newNikname }, { merge: true });
  };
  const handleChangeAvatar = async (fileToDel, downloadURL) => {
    delFileFromStorage();
    const cityRef = doc(db, "users", auth.currentUser.email);
    await setDoc(
      cityRef,
      { photoURL: downloadURL, file: fileToDel, nikname: newNikname || userProfileData.nikname },
      { merge: true }
    );
  };

  return (
    <>
      <BlockMenuProfile onPress={() => setVisibilityMenu(!visibilityMenu)}>
        <MaterialCommunityIcons
          style={{ marginLeft: "5%" }}
          name="menu"
          size={30}
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
            <BlockProfileText>
              {loadingUserProfileData ? <Text>Loading...</Text> : auth.currentUser.email}
            </BlockProfileText>
          </BlockProfileSectionEmail>
          <BlockProfileSectionNikname>
            <BlockProfileText>Nikname:</BlockProfileText>
            <BlockProfileText>
              {loadingUserProfileData ? <Text>Loading...</Text> : userProfileData?.nikname || "wait for Nikname"}
            </BlockProfileText>
            <ChangeNikname
              onPress={() => {
                setNewNikname("");
                setChangeNiknameModal(true);
              }}
            >
              <FontAwesome6 name="edit" size={30} color={colors.menuProfileText} />
            </ChangeNikname>
          </BlockProfileSectionNikname>
          <BlockProfileSectionAvatar onPress={() => pickImage()}>
            <Image
              style={{ width: "50%", aspectRatio: 1, objectfit: "cover", borderRadius: 180 }}
              source={{
                uri: loadingUserProfileData ? <Text>Loading...</Text> : newPhotoURL || userProfileData.photoURL,
              }}
            />
          </BlockProfileSectionAvatar>
          <ButtonLogout
            onPress={() => {
              logOut();
            }}
            title="Logout"
          >
            <ButtonLogoutText>Logout</ButtonLogoutText>
          </ButtonLogout>
        </BlockProfile>
      ) : null}
    </>
  );
}
