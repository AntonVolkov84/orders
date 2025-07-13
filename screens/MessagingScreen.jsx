import React, { useState, useEffect, useRef } from "react";
import { Keyboard, View, Text, FlatList, Dimensions } from "react-native";
import styled from "styled-components/native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import * as colors from "../variables/colors";
import { db, auth, app, database } from "../firebaseConfig";
import Button from "../components/Button";
import Message from "../components/Message";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Fontisto from "@expo/vector-icons/Fontisto";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { ref as dbRef, set } from "firebase/database";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  where,
  updateDoc,
  arrayRemove,
  doc,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

const screenHeight = Dimensions.get("screen").height;

// --- Styled components ---
const BlockButton = styled.View`
  width: 100%;
  height: ${screenHeight < 760 ? "40px" : "50px"};
  flex-direction: row;
  justify-content: flex-start;
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
  justify-content: center;
  align-items: center;
  aspect-ratio: 1;
`;

const BlockIconMessagePicture = styled.TouchableOpacity`
  position: absolute;
  right: 50px;
  height: 100%;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1;
`;

const BlockForMessage = styled.View`
  width: 100%;
  margin-bottom: 20px;
`;

// --- Component ---
export default function MessagingScreen({ route, navigation }) {
  const { item } = route.params;
  const [message, setMessage] = useState("");
  const [messageUpdate, setMessageUpdate] = useState("");
  const [fetchedMessages, setFetchedMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(10);

  const conversationId = item.docId;
  const currentUser = auth.currentUser;
  const currentEmail = currentUser.email;
  const flatList = useRef(null);
  const isScrolledToBottom = useRef(true);
  const storage = getStorage(app);
  const { t } = useTranslation();
  const nameOfOrder = item.nameOfOrder;

  // --- Keyboard listeners to adjust input position ---
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => setKeyboardOffset(85));
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardOffset(10));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // --- Update message state when editing ---
  useEffect(() => {
    if (messageUpdate.messageText) {
      setMessage(messageUpdate.messageText);
    }
  }, [messageUpdate]);

  // --- Fetch messages in real-time ---
  useEffect(() => {
    const q = query(collection(db, "messages", conversationId, "conversation"), orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        docId: doc.id,
        parentId: doc.ref.parent.parent.id,
        timestamp: doc.data().timestamp,
        ...doc.data(),
      }));
      setFetchedMessages(messages);
      setLoaded(true);
    });

    return () => unsubscribe();
  }, [conversationId]);

  // --- Scroll to bottom when new messages arrive ---
  useEffect(() => {
    markMessagesAsRead();

    if (isScrolledToBottom.current && flatList.current) {
      flatList.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [fetchedMessages]);

  // --- Mark unread messages as read ---
  const markMessagesAsRead = async () => {
    try {
      const refForChangeMessageStatus = query(
        collection(db, "messages", conversationId, "conversation"),
        where("doNotReadBy", "array-contains", currentEmail)
      );
      const unreadMessages = await getDocs(refForChangeMessageStatus);

      unreadMessages.forEach(async (document) => {
        const messageRef = doc(db, "messages", conversationId, "conversation", document.id);
        await updateDoc(messageRef, { doNotReadBy: arrayRemove(currentEmail) });
      });
    } catch (error) {
      console.log("markMessagesAsRead error:", error);
    }
  };

  // --- Pick image from gallery ---
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length) {
        const uri = result.assets[0].uri;
        const fileName = result.assets[0].fileName || `image_${Date.now()}.jpg`;
        const refStorage = storageRef(storage, `images/${fileName}`);

        await uploadImageToStorage(refStorage, uri, fileName);
      }
    } catch (error) {
      console.log("pickImage error:", error);
    }
  };

  // --- Upload image to Firebase Storage and send message with image URL ---
  const uploadImageToStorage = async (refStorage, uri, fileName) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const uploadTask = uploadBytesResumable(refStorage, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.log("Upload error:", error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          sendMessage("image", downloadURL, fileName);
        }
      );
    } catch (error) {
      console.log("uploadImageToStorage error:", error);
    }
  };

  // --- Send message (text or image) ---
  const sendMessage = async (type = "text", uri = "", storagePath = "") => {
    if (!message && type === "text") return;

    try {
      const recipients = item.participants.filter((email) => email !== currentEmail);
      const data = {
        participants: item.participants,
        messageId: Date.now(),
        type,
        uri,
        staragePath: storagePath,
        doNotReadBy: recipients,
        messageText: message || "",
        author: currentEmail,
        timestamp: new Date().toISOString(),
      };

      // Save to Realtime Database
      await set(dbRef(database, `messages/${conversationId}/${data.messageId}`), data);
      // Save to Firestore
      await addDoc(collection(db, "messages", conversationId, "conversation"), data);

      // Send push notifications
      const pushTokens = [];
      for (const receiverEmail of recipients) {
        const docSnap = await getDoc(doc(db, "users", receiverEmail));
        if (docSnap.exists()) {
          pushTokens.push(docSnap.data().pushToken);
        }
      }

      if (pushTokens.length) {
        const pushMessage = {
          to: pushTokens,
          sound: "default",
          title: `${nameOfOrder} ${auth.currentUser.displayName || currentEmail}`,
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
      }

      setMessage("");
    } catch (error) {
      console.log("sendMessage error:", error);
    }
  };

  // --- Update existing message ---
  const updateMessage = async () => {
    try {
      await updateDoc(doc(db, "messages", messageUpdate.parentId, "conversation", messageUpdate.docId), {
        messageText: message,
      });
      setMessageUpdate("");
      setMessage("");
    } catch (error) {
      console.log("updateMessage error:", error);
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
          <BlockForMessage style={{ marginBottom: keyboardOffset }}>
            <FlatList
              onScroll={(event) => {
                Keyboard.dismiss();
                const offsetY = event.nativeEvent.contentOffset.y;
                isScrolledToBottom.current = offsetY < 100;
              }}
              scrollEventThrottle={16}
              accessibilityLabel="Messages list"
              accessible={true}
              data={fetchedMessages}
              ref={flatList}
              renderItem={({ item }) => <Message setMessageUpdate={setMessageUpdate} message={item} />}
              keyExtractor={(item) => item.docId}
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
        />
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
}
