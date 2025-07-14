import React, { useState, useEffect, useRef } from "react";
import { Keyboard, View, Text, FlatList, Dimensions, TextInput, TouchableOpacity, StyleSheet } from "react-native";
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

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => setKeyboardOffset(85));
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardOffset(10));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (messageUpdate.messageText) {
      setMessage(messageUpdate.messageText);
    }
  }, [messageUpdate]);

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

  useEffect(() => {
    markMessagesAsRead();

    if (isScrolledToBottom.current && flatList.current) {
      flatList.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [fetchedMessages]);

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

      await set(dbRef(database, `messages/${conversationId}/${data.messageId}`), data);
      await addDoc(collection(db, "messages", conversationId, "conversation"), data);

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
      style={styles.linearGradient}
    >
      <StatusBar style="light" />
      <View style={styles.blockButton}>
        <TouchableOpacity
          accessibilityLabel="Button go back"
          accessible={true}
          onPress={() => navigation.goBack()}
          style={styles.blockButtonBtn}
        >
          <Button>{t("MessagingGoBack")}</Button>
        </TouchableOpacity>
      </View>

      <View style={styles.blockMessaging}>
        {loaded ? (
          <View style={[styles.blockForMessage, { marginBottom: keyboardOffset }]}>
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
              inverted
            />
          </View>
        ) : (
          <Text style={styles.loadingText}>Loading...</Text>
        )}
      </View>

      <View style={styles.boxInput}>
        <TextInput
          placeholderTextColor={colors.MessagingPlaceholder}
          placeholder={t("MessagingMakeMessage")}
          multiline
          onChangeText={setMessage}
          value={message}
          style={styles.boxInputText}
        />
        {!message && (
          <TouchableOpacity
            accessibilityLabel="Button add picture"
            accessible={true}
            onPress={pickImage}
            style={styles.blockIconMessagePicture}
          >
            <Fontisto name="picture" size={screenHeight < 760 ? 20 : 25} color={colors.MessagingIconColor} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          accessibilityLabel="Button add message"
          accessible={true}
          onPress={() => (messageUpdate ? updateMessage() : sendMessage())}
          style={styles.blockIconMessage}
        >
          <FontAwesome name="send" size={screenHeight < 760 ? 20 : 25} color={colors.MessagingIconColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.adContainer}>
        <BannerAd
          unitId="ca-app-pub-9267417700367649/6433322697"
          onAdFailedToLoad={(error) => console.log(error)}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  linearGradient: {
    height: "100%",
    width: "100%",
    paddingTop: "5%",
    paddingHorizontal: "5%",
  },
  blockButton: {
    width: "100%",
    height: screenHeight < 760 ? 40 : 50,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: "3%",
    marginTop: "10%",
  },
  blockButtonBtn: {
    width: "33%",
    height: "100%",
  },
  blockMessaging: {
    width: "100%",
    height: "70%",
  },
  blockForMessage: {
    width: "100%",
    marginBottom: 20,
  },
  loadingText: {
    color: colors.titleText,
    fontSize: screenHeight < 760 ? 15 : 20,
  },
  boxInput: {
    backgroundColor: colors.MessagingInputBackground,
    padding: 3,
    width: "99%",
    height: screenHeight < 760 ? 48 : 60,
    position: "absolute",
    bottom: 70,
    left: "6%",
    borderRadius: 10,
    flexDirection: "row",
  },
  boxInputText: {
    padding: 5,
    width: "90%",
    height: "100%",
    color: colors.MessagingInputColor,
    fontSize: screenHeight < 760 ? 13 : 18,
  },
  blockIconMessage: {
    position: "absolute",
    right: 0,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1,
  },
  blockIconMessagePicture: {
    position: "absolute",
    right: 50,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1,
  },
  adContainer: {
    position: "absolute",
    bottom: 0,
    paddingLeft: "1%",
    width: "100%",
  },
});
