import { Keyboard, View, Text, TouchableOpacity, FlatList } from "react-native";
import React, { useState, useEffect, memo } from "react";
import * as colors from "../variables/colors";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import styled from "styled-components";
import { db, auth, app } from "../firebaseConfig";
import Button from "../components/Button";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import Fontisto from "@expo/vector-icons/Fontisto";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, getStorage, ref, uploadBytesResumable, deleteObject } from "firebase/storage";
import {
  doc,
  addDoc,
  onSnapshot,
  collection,
  orderBy,
  serverTimestamp,
  query,
  getDoc,
  getDocs,
  where,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import Message from "../components/Message";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { Dimensions } from "react-native";

const screenHeight = Dimensions.get("screen").height;

const BlockButton = styled.View`
  width: 100%;
  height: ${screenHeight < 760 ? "40px" : "50px"};
  flex-direction: row;
  justify-content: start;
  align-items: center;
  margin-bottom: 3%;
  margin-top: 10%;
`;
const BlockButtonBtn = styled.TouchableOpacity`
  width: 33%;
  height: 100%;
`;
const BlockMessaging = styled.View`
  width: 100%;
  height: 70%;
`;
const BoxInput = styled.View`
  background-color: ${colors.MessagingInputBackground};
  padding: 3px;
  width: 99%;
  height: ${screenHeight < 760 ? "48px" : "60px"};
  position: absolute;
  bottom: 70px;
  left: 6%;
  border-radius: 10px;
  flex-direction: row;
`;
const BoxInputText = styled.TextInput`
  padding: 5px;
  width: 90%;
  height: 100%;
  color: ${colors.MessagingInputColor};
  font-size: ${screenHeight < 760 ? "13px" : "18px"};
`;
const BlockIconMessage = styled.TouchableOpacity`
  position: absolute;
  right: 0;
  height: 100%;
  align-self: center;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1;
`;
const BlockIconMessagePicture = styled.TouchableOpacity`
  position: absolute;
  right: 50px;
  height: 100%;
  align-self: center;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1;
`;
const BlockForMessage = styled.View`
  width: 100%;
  height: fit-content;
  margin-bottom: 20px;
`;

export default memo(function MessagingScreen({ route, navigation }) {
  const { item } = route.params;
  const [message, setMessage] = useState("");
  const [messageUpdate, setMessageUpdate] = useState("");
  const [fetchedMessages, setFetchedMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const conversationId = item.docId;
  const currentUser = auth.currentUser;
  const flatList = React.useRef(null);
  const currentEmail = currentUser.email;
  const { t } = useTranslation();
  const nameOfOrder = item.nameOfOrder;
  const storage = getStorage(app);

  useEffect(() => {
    setMessage(messageUpdate.messageText);
  }, [messageUpdate]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });

      if (result) {
        const uriForStorage = result.assets[0].uri;
        const fileToDel = result.assets[0].fileName;
        const storageRef = ref(storage, `images/${fileToDel}`);
        addToFirebaseStorage(storageRef, uriForStorage, fileToDel);
        sendMessage();
      }
    } catch (error) {
      console.log("pickImage", error.message);
    }
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
            sendMessage("image", uriForStorage, fileToDel);
          });
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const markMessagesAsRead = async () => {
    const refForChangeMessageStatus = query(
      collection(db, "messages", conversationId, "conversation"),
      where("doNotReadBy", "array-contains", currentEmail)
    );
    const unreadMessages = await getDocs(refForChangeMessageStatus);
    const docForUpdate = [];
    unreadMessages.forEach(async (document) => {
      docForUpdate.push(document.id);
    });
    docForUpdate.forEach(async (id) => {
      const messageRef = doc(db, "messages", conversationId, "conversation", id);
      await updateDoc(messageRef, { doNotReadBy: arrayRemove(currentEmail) });
    });
  };

  const sendMessage = async (type = "text", uri = "", staragePath = "") => {
    try {
      if (message || type === "image") {
        const arrOfReciverMessage = item.participants.filter((email) => email !== currentEmail);
        const data = {
          messageId: Date.parse(new Date()),
          type: type,
          uri: uri,
          staragePath: staragePath,
          doNotReadBy: arrOfReciverMessage,
          messageText: message || "",
          author: currentUser.email,
          timestamp: serverTimestamp(),
        };
        await addDoc(collection(db, "messages", conversationId, "conversation"), data);
      }
      const arrOfReseiver = [];
      const participantsWithoutCurrentUser = item.participants.filter((email) => email !== currentUser.email);
      for (let i = 0; i < participantsWithoutCurrentUser.length; i++) {
        const docSnap = await getDoc(doc(db, "users", participantsWithoutCurrentUser[i]));
        arrOfReseiver.push(docSnap.data().pushToken);
      }
      try {
        const pushMessage = {
          to: arrOfReseiver,
          sound: `default`,
          title: `Comment for ORDER ${nameOfOrder}`,
          body: message,
        };
        await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            host: "exp.host",
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pushMessage),
        });
        setMessage("");
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log("send message", error);
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "messages", conversationId, "conversation"), orderBy("timestamp", "desc")),
      (snapshot) => {
        setFetchedMessages(
          snapshot.docs.map((doc) => ({
            docId: doc.id,
            parentId: doc.ref.parent.parent.id,
            ...doc.data(),
          }))
        );
        setLoaded(true);
      }
    );
    markMessagesAsRead();
    return () => unsub();
  }, []);

  const updateMessage = async () => {
    try {
      await updateDoc(doc(db, "messages", messageUpdate.parentId, "conversation", messageUpdate.docId), {
        messageText: message,
      });
      setMessageUpdate("");
      setMessage("");
    } catch (error) {
      console.log("updateMessage", error.message);
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
      style={{ height: "100%", width: "100%", paddingTop: "5%", paddingHorizontal: "5%" }}
    >
      <StatusBar style="light" />
      <BlockButton>
        <BlockButtonBtn
          accessibilityLabel="Button go back"
          accessible={true}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Button children={t("MessagingGoBack")} />
        </BlockButtonBtn>
      </BlockButton>
      <BlockMessaging>
        {loaded ? (
          <BlockForMessage>
            <FlatList
              onScroll={() => Keyboard.dismiss()}
              accessibilityLabel="Messages list"
              accessible={true}
              data={fetchedMessages}
              ref={flatList}
              renderItem={({ item }) => <Message setMessageUpdate={setMessageUpdate} message={item} />}
              keyExtractor={(item, index) => index}
            />
          </BlockForMessage>
        ) : (
          <Text style={{ color: colors.titleText, fontSize: screenHeight < 760 ? 15 : 20 }}>Loading...</Text>
        )}
      </BlockMessaging>
      <BoxInput>
        <BoxInputText
          placeholderTextColor={colors.MessagingPlaceholder}
          placeholder={t("MessagingMakeMessage")}
          multiline
          onChangeText={setMessage}
          value={message}
        ></BoxInputText>
        {!message && (
          <BlockIconMessagePicture
            accessibilityLabel="Button add picture"
            accessible={true}
            onPress={() => pickImage()}
          >
            <Fontisto name="picture" size={screenHeight < 760 ? 20 : 25} color={colors.MessagingIconColor} />
          </BlockIconMessagePicture>
        )}

        <BlockIconMessage
          accessibilityLabel="Button add message"
          accessible={true}
          onPress={() => (messageUpdate ? updateMessage() : sendMessage())}
        >
          <FontAwesome name="send" size={screenHeight < 760 ? 20 : 25} color={colors.MessagingIconColor} />
        </BlockIconMessage>
      </BoxInput>
      <View style={{ position: "absolute", bottom: 0, paddingleft: "1%" }}>
        <BannerAd
          unitId="ca-app-pub-9267417700367649/6433322697"
          onAdFailedToLoad={(error) => console.log(error)}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </View>
    </LinearGradient>
  );
});
