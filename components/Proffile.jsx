import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Linking,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useEffect, useState } from "react";
import * as colors from "../variables/colors";
import { signOut } from "firebase/auth";
import * as NavigationBar from "expo-navigation-bar";
import { db, app, auth } from "../firebaseConfig";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, getStorage, ref, uploadBytesResumable, deleteObject } from "firebase/storage";
import { useTranslation } from "react-i18next";
import i18next from "../i18next";
import { LanguageResources } from "../i18next";
import languageList from "../locales/languagesList.json";

const screenHeight = Dimensions.get("screen").height;

const styles = StyleSheet.create({
  blockMenuProfile: {
    width: "98%",
    height: "7%",
    backgroundColor: colors.blockMenuProfile,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginLeft: "1%",
  },
  blockMenuProfileText: {
    color: colors.blockMenuFrofileText,
    fontSize: screenHeight < 760 ? 20 : 30,
    marginLeft: "5%",
  },
  blockProfile: {
    width: "98%",
    height: "88%",
    position: "absolute",
    marginTop: "3%",
    backgroundColor: colors.menuProfile,
    top: "10%",
    marginLeft: "1%",
    zIndex: 2,
  },
  blockProfileSectionNikname: {
    width: "100%",
    height: "10%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.menuProfile,
  },
  blockProfileSectionLanguage: {
    width: "100%",
    height: "10%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.menuProfile,
  },
  blockProfileSectionEmail: {
    width: "90%",
    height: "10%",
    marginLeft: "5%",
    marginRight: "5%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  changeNikname: {
    width: "10%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "5%",
  },
  changeLanguage: {
    width: "10%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "5%",
  },
  modalNikname: {
    width: "100%",
    height: "105%",
    position: "absolute",
    backgroundColor: colors.modalNiknameBackground,
    paddingTop: "30%",
    alignItems: "center",
    zIndex: 3,
  },
  modalNiknameEntry: {
    width: "98%",
    height: screenHeight < 760 ? 200 : 250,
    borderRadius: 10,
    backgroundColor: colors.modalNiknameBackgroundWindow,
    justifyContent: "center",
    alignItems: "center",
    gap: "40%",
  },
  modalNiknameInput: {
    width: "100%",
    height: "30%",
    backgroundColor: colors.modalNiknameInput,
    paddingLeft: "5%",
    fontSize: screenHeight < 760 ? 20 : 25,
  },
  modalBlockBtn: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalNiknameBtnCancel: {
    width: "20%",
    aspectRatio: 4 / 3,
    borderRadius: 18,
    backgroundColor: colors.ModalNiknameBtnCancel,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "5%",
  },
  modalNiknameBtnOk: {
    width: "20%",
    aspectRatio: 4 / 3,
    borderRadius: 18,
    backgroundColor: colors.ModalNiknameBtnOk,
    justifyContent: "center",
    alignItems: "center",
    marginRight: "5%",
  },
  modalNiknameBtnText: {
    color: colors.modalNiknameBtnText,
    fontSize: screenHeight < 760 ? 13 : 15,
  },
  blockProfileSectionAvatar: {
    width: "100%",
    height: "48%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.menuProfile,
  },
  blockProfileText: {
    color: colors.menuFrofileText,
    fontSize: screenHeight < 760 ? 20 : 25,
    marginLeft: "5%",
    flexWrap: "wrap",
  },
  blockProfileTextEmail: {
    color: colors.menuFrofileText,
    fontSize: screenHeight < 760 ? 15 : 20,
    marginLeft: "5%",
  },
  blockProfileTextEmail1: {
    color: colors.menuFrofileText,
    fontSize: screenHeight < 760 ? 15 : 20,
    marginLeft: "5%",
    width: 250,
  },
  buttonLogout: {
    width: "100%",
    height: "7%",
    backgroundColor: colors.backgroundLogoutBtn,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonLogoutText: {
    color: colors.titleText,
    fontSize: screenHeight < 760 ? 20 : 25,
  },
  modalLanguage: {
    width: "100%",
    height: "105%",
    position: "absolute",
    backgroundColor: colors.modalNiknameBackground,
    paddingTop: "30%",
    alignItems: "center",
    zIndex: 3,
  },
  choseLanguage: {},
  languageText: {
    color: colors.titleText,
    fontSize: screenHeight < 760 ? 25 : 30,
    textAlign: "center",
  },
  blockSite: {
    width: "100%",
    height: "10%",
    justifyContent: "center",
    alignItems: "center",
  },
  site: {
    height: "100%",
  },
  siteText: {
    color: colors.SiteText,
    fontSize: screenHeight < 760 ? 15 : 20,
  },
  blockNameAndChangeName: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "98%",
    paddingLeft: "1%",
    paddingRight: "1%",
  },
  imageAvatar: {
    width: "50%",
    aspectRatio: 1,
    borderRadius: 180,
  },
});

export default function DashboardScreen({ navigation }) {
  const [userProfileData, setUserProfileData] = useState(null);
  const [loadingUserProfileData, setLoadingUserProfileData] = useState(true);
  const [visibilityMenu, setVisibilityMenu] = useState(false);
  const [changeNiknameModal, setChangeNiknameModal] = useState(false);
  const [newNikname, setNewNikname] = useState("");
  const [newPhotoURL, setNewPhotoURL] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [language, setLanguage] = useState("en");
  const [changeLanguageModal, setChangeLanguageModal] = useState(false);
  const storage = getStorage(app);
  const { t } = useTranslation();

  const changeLng = (lng) => {
    i18next.changeLanguage(lng);
    setChangeLanguageModal(false);
    handleChangeLanguage(lng);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
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

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "users", auth.currentUser.email), (snapshot) => {
      const data = setUserProfileData(snapshot.data());
      if (data) {
        setUserProfileData(data);
        if (data.language) {
          i18next.changeLanguage(data.language);
        }
      }
    });
    setLoadingUserProfileData(false);
    customNavigationBar();
    return () => unsub();
  }, []);

  const handleChangeNikname = async () => {
    const cityRef = doc(db, "users", auth.currentUser.email);
    await setDoc(cityRef, { nikname: newNikname }, { merge: true });
  };
  const handleChangeLanguage = async (lng) => {
    const cityRef = doc(db, "users", auth.currentUser.email);
    await setDoc(cityRef, { language: lng }, { merge: true });
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
  const redirectToSite = () => {
    const link = "https://orders-78c1c.web.app/";
    Linking.openURL(link);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.blockMenuProfile, loadingUserProfileData && { opacity: 0.5 }]}
        disabled={loadingUserProfileData}
        accessibilityLabel="Button which toggle to open or close profile menu"
        accessible={true}
        onPress={() => setVisibilityMenu(!visibilityMenu)}
      >
        <MaterialCommunityIcons
          style={{ marginLeft: "5%" }}
          name="menu"
          size={screenHeight < 760 ? 20 : 30}
          color={colors.BlockMenuProfileText}
        />
        <Text style={styles.blockMenuProfileText}>{t("Proffile")}</Text>
      </TouchableOpacity>

      {changeNiknameModal && (
        <View style={styles.modalNikname} accessibilityLabel="Block which change nikname" accessible={true}>
          <View style={styles.modalNiknameEntry}>
            <TextInput
              style={styles.modalNiknameInput}
              onChangeText={setNewNikname}
              maxLength={20}
              placeholder={t("ProffilePlaceholderNikname")}
            />
            <View style={styles.modalBlockBtn}>
              <TouchableOpacity style={styles.modalNiknameBtnCancel} onPress={() => setChangeNiknameModal(false)}>
                <Text style={styles.modalNiknameBtnText}>{t("ProffileCancel")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalNiknameBtnOk}
                onPress={() => {
                  handleChangeNikname();
                  setChangeNiknameModal(false);
                }}
              >
                <Text style={styles.modalNiknameBtnText}>{t("ProffileOk")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {visibilityMenu && (
        <View style={styles.blockProfile} accessibilityLabel="Block whith information about user" accessible={true}>
          <View style={styles.blockProfileSectionEmail}>
            <Text style={styles.blockProfileTextEmail}>{t("ProffileEmail")}</Text>
            <Text style={styles.blockProfileTextEmail1} numberOfLines={1}>
              {loadingUserProfileData ? "Loading..." : auth.currentUser.email}
            </Text>
          </View>

          <TouchableOpacity style={styles.blockProfileSectionNikname}>
            <Text style={styles.blockProfileText}>{t("ProffileNikname")}</Text>
            <View style={styles.blockNameAndChangeName}>
              <Text style={[styles.blockProfileText, { maxWidth: "70%" }]}>
                {loadingUserProfileData ? "Loading..." : userProfileData?.nikname || "wait for Nikname"}
              </Text>
              <TouchableOpacity
                style={styles.changeNikname}
                accessibilityLabel="Button to open window change nikname"
                accessible={true}
                onPress={() => {
                  setNewNikname("");
                  setChangeNiknameModal(true);
                }}
              >
                <FontAwesome6 name="edit" size={screenHeight < 760 ? 25 : 35} color={colors.menuProfileText} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.blockProfileSectionLanguage}>
            <Text style={styles.blockProfileText}>{t("ProffileLanguage")}</Text>
            <Text style={styles.blockProfileText}>
              {loadingUserProfileData ? "Loading..." : languageList[userProfileData.language]?.nativeName || "en"}
            </Text>
            <TouchableOpacity
              style={styles.changeLanguage}
              accessibilityLabel="Button to open window change language"
              accessible={true}
              onPress={() => setChangeLanguageModal(true)}
            >
              <FontAwesome6 name="edit" size={screenHeight < 760 ? 25 : 35} color={colors.menuProfileText} />
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.blockProfileSectionAvatar}
            accessibilityLabel="Button change avatar, choose from galery"
            accessible={true}
            onPress={pickImage}
          >
            <Image
              style={styles.imageAvatar}
              source={{ uri: loadingUserProfileData ? null : newPhotoURL || userProfileData.photoURL }}
            />
          </TouchableOpacity>

          <View style={styles.blockSite}>
            <TouchableOpacity
              style={styles.site}
              accessibilityLabel="Redirect to site of Order App"
              accessible={true}
              onPress={redirectToSite}
            >
              <Text style={styles.siteText}>{t("SiteText")}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.buttonLogout}
            accessibilityLabel="Button logout"
            accessible={true}
            onPress={logOut}
          >
            <Text style={styles.buttonLogoutText}>{t("ProffileLogout")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {changeLanguageModal && (
        <View style={styles.modalLanguage} accessibilityLabel="Modal window to change language" accessible={true}>
          <TouchableOpacity onPress={() => setChangeLanguageModal(false)} style={{ width: "100%" }}>
            <Text style={[styles.languageText, { color: "white", textAlign: "center", marginBottom: "15%" }]}>
              {t("ProffileCancel")}
            </Text>
            <FlatList
              data={Object.keys(LanguageResources)}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <View style={{ marginTop: "5%" }}>
                  <TouchableOpacity
                    style={styles.choseLanguage}
                    accessibilityLabel={`Button to change language to ${languageList[item]?.nativeName}`}
                    accessible={true}
                    onPress={() => {
                      setLanguage(item);
                      changeLng(item);
                    }}
                  >
                    <Text style={styles.languageText}>{languageList[item]?.nativeName}</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}
