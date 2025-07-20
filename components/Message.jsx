import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useState, useEffect, memo } from "react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import * as colors from "../variables/colors";
import { useTranslation } from "react-i18next";
import { remove, ref as dbRef } from "firebase/database";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { app, database } from "../firebaseConfig";

const screenHeight = Dimensions.get("screen").height;

const styles = StyleSheet.create({
  blockMessage: {
    width: "70%",
    borderRadius: 5,
    flexDirection: "row",
    marginTop: 5,
  },
  blockForMessageAuthor: {
    width: "18%",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 3,
    marginLeft: 3,
  },
  authorAvatar: {
    width: "70%",
    borderRadius: 50,
    aspectRatio: 1,
  },
  authorName: {
    fontSize: 10,
    color: colors.titleText,
  },
  blockForMessageText: {
    width: screenHeight < 760 ? 170 : 200,
    color: "white",
    paddingRight: 8,
    fontSize: screenHeight < 760 ? 10 : 15,
  },
  modal: {
    width: "70%",
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
    marginLeft: "30%",
    backgroundColor: colors.MessageBackgroundColorWithAuthor,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalBtn: {
    width: 70,
    height: 30,
    backgroundColor: colors.MessageBackgroundColor,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnText: {
    fontSize: screenHeight < 760 ? 8 : 12,
    textAlign: "center",
    color: "white",
  },
  boxForMessage: {
    width: "84%",
    paddingLeft: 5,
    paddingRight: 5,
    justifyContent: "flex-start",
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 5,
    resizeMode: "cover",
  },
});

export default memo(function Message({
  message,
  updateParticipantsData,
  setMessageUpdate,
  conversationId,
  participantsData,
}) {
  const [loaded, setLoaded] = useState(false);
  const [author, setAuthor] = useState(null);
  const [modalMessage, setModalMessage] = useState(false);
  const messageAuthor = message.author;
  const currentUser = auth.currentUser;
  const email = currentUser.email;
  const isValide = email === messageAuthor;
  const { t } = useTranslation();
  const storage = getStorage(app);
  console.log(message);
  useEffect(() => {
    const fetchMissingAuthor = async () => {
      if (!participantsData?.[messageAuthor]) {
        try {
          const docRef = doc(db, "users", messageAuthor);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const newAuthor = snap.data();
            setAuthor(newAuthor);
            setLoaded(true);
            if (typeof updateParticipantsData === "function") {
              updateParticipantsData(messageAuthor, newAuthor);
            }
          }
        } catch (err) {
          console.warn("Ошибка загрузки участника:", err);
        }
      } else {
        setAuthor(participantsData[messageAuthor]);
        setLoaded(true);
      }
    };

    if (messageAuthor) fetchMissingAuthor();
  }, [participantsData, messageAuthor]);

  const deleteImageFromStorage = async (path) => {
    const imageRef = ref(storage, `images/${path}`);
    try {
      await deleteObject(imageRef);
    } catch (error) {
      console.error(`Ошибка при удалении ${path}:`, error);
    }
  };
  const deleteMessage = async () => {
    try {
      if (message.type === "image") {
        await deleteImageFromStorage(message.storagePath);
      }
      await remove(dbRef(database, `messages/${conversationId}/${message.messageId}`));
    } catch (error) {
      console.log("deleteMessage error:", error);
    }
  };

  return (
    <>
      {loaded ? (
        <>
          {modalMessage && isValide ? (
            <View style={styles.modal}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setModalMessage(false)}>
                <Text style={styles.modalBtnText}>{t("ProffileCancel")}</Text>
              </TouchableOpacity>
              {message.type === "image" ? null : (
                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={() => {
                    setMessageUpdate({
                      ...message,
                    });
                    setModalMessage(false);
                  }}
                >
                  <Text style={styles.modalBtnText}>{t("messageModalUpdate")}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => {
                  deleteMessage();
                  setModalMessage(false);
                }}
              >
                <Text style={styles.modalBtnText}>{t("messageModalDelete")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onLongPress={() => setModalMessage(true)}
              accessibilityLabel={`Message: ${message.messageText}`}
              accessible={true}
              style={[
                styles.blockMessage,
                {
                  backgroundColor: isValide ? colors.MessageBackgroundColorWithAuthor : colors.MessageBackgroundColor,
                  flexDirection: isValide ? "row-reverse" : "row",
                  marginLeft: isValide ? "30%" : 0,
                  paddingLeft: isValide ? (message.type === "image" ? 0 : 5) : 3,
                  paddingRight: isValide ? 3 : 5,
                },
              ]}
            >
              <View style={styles.blockForMessageAuthor}>
                <Image
                  style={styles.authorAvatar}
                  source={author?.photoURL ? { uri: author.photoURL } : require("../assets/Orders3.png")}
                />
                <Text style={styles.authorName}>{author.nikname}</Text>
              </View>
              {message.type === "image" ? (
                <Image source={{ uri: message.uri }} style={styles.imageMessage} />
              ) : (
                <View style={styles.boxForMessage}>
                  <Text style={styles.blockForMessageText}>{message.messageText}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </>
      ) : null}
    </>
  );
});
