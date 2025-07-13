import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Dimensions } from "react-native";
import { useState, useEffect, memo } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as colors from "../variables/colors";
import { doc, getDoc, updateDoc, arrayRemove, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Button from "./Button";
import { db } from "../firebaseConfig";
import { useTranslation } from "react-i18next";
import ModalAddingParticipant from "./ModalAddingParticipant";

const screenHeight = Dimensions.get("screen").height;

export default memo(function AddingParticipant({ updateParticipants, participants, setParticipants }) {
  const auth = getAuth();
  const [loadingData, setLoadingData] = useState(true);
  const [allParticipantsData, setAllParticipantsData] = useState([]);
  const [addingParticipantModal, setAddingParticipantModal] = useState(false);
  const [noOneParticipant, setNoOneParticipant] = useState(true);
  const [delParticipantModal, setDelParticipantModal] = useState(false);
  const [participantForDeleting, setParticipantForDeleting] = useState("");
  const [arrayOfParticipants, setArrayOfParticipants] = useState([]);
  const { t } = useTranslation();
  const currentEmail = auth.currentUser.email;

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "Participants", currentEmail), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setArrayOfParticipants(data.participants || []);
        setNoOneParticipant(data.participants?.length === 0);
      } else {
        setArrayOfParticipants([]);
        setNoOneParticipant(true);
      }
      setLoadingData(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    getdata(arrayOfParticipants);
  }, [arrayOfParticipants]);

  const getdata = async (arr = []) => {
    try {
      const promises = arr.map((id) => getDoc(doc(db, "users", id)));
      const docs = await Promise.all(promises);
      const newArr = docs.filter((docSnap) => docSnap.exists()).map((docSnap) => docSnap.data());
      setAllParticipantsData(newArr);
    } catch (err) {
      console.log("Ошибка при загрузке данных участников:", err.message);
    } finally {
      setLoadingData(false);
    }
  };

  const addParticipantsToOrder = (participant) => {
    const dublicate = participants.some((e) => e.email === participant.email);
    if (!dublicate) {
      setParticipants((prevParticipants) => [...prevParticipants, { ...participant }]);
    }
  };

  const handleLongPress = (participant) => {
    setDelParticipantModal(true);
    setParticipantForDeleting(participant.email);
  };

  const delParticipantData = async (participant) => {
    try {
      await updateDoc(doc(db, "Participants", currentEmail), {
        participants: arrayRemove(participant),
      });
    } catch (error) {
      console.log("delParticipantData", error.message);
    }
  };

  return (
    <>
      {delParticipantModal && (
        <View style={styles.ModalDelParticipant}>
          <Text style={styles.ModalDelParticipantText}>
            {t("AddingParticipantsAskDelParticipant")} {participantForDeleting}
          </Text>
          <View style={styles.ModalButton}>
            <TouchableOpacity
              style={styles.ModalButtonBtn}
              onPress={() => {
                setDelParticipantModal(false);
              }}
            >
              <Button children={t("ProffileCancel")} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ModalButtonBtn}
              onPress={() => {
                setDelParticipantModal(false);
                delParticipantData(participantForDeleting);
                setParticipantForDeleting("");
              }}
            >
              <Button children={t("AddingParticipantsDel")} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {addingParticipantModal ? (
        <ModalAddingParticipant setAddingParticipantModal={setAddingParticipantModal} />
      ) : loadingData ? (
        <View style={styles.BlockNoOne}>
          <TouchableOpacity style={styles.BlockNoOneIcon} onPress={() => setAddingParticipantModal(true)}>
            <MaterialCommunityIcons
              name="account-plus-outline"
              size={screenHeight < 760 ? 30 : 40}
              color={colors.APBorderColor}
            />
          </TouchableOpacity>
          {noOneParticipant ? (
            <Text style={{ color: colors.titleText, fontSize: 20 }}>{t("AddingParticipantsNoOne")}</Text>
          ) : (
            <Text
              style={{
                textAlign: "center",
                textJustify: "center",
                color: colors.titleText,
                fontSize: 20,
              }}
            >
              Loading...
            </Text>
          )}
        </View>
      ) : (
        <ScrollView style={styles.Repair} horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.BlockIcon}
            accessibilityLabel="Button view modal window for adding participant to global list"
            accessible={true}
            onPress={() => setAddingParticipantModal(true)}
          >
            <MaterialCommunityIcons
              name="account-plus-outline"
              size={screenHeight < 760 ? 30 : 40}
              color={colors.APBorderColor}
            />
          </TouchableOpacity>
          {allParticipantsData.map((p, index) => {
            return (
              <TouchableOpacity
                accessibilityLabel={`Participant: ${p.nikname}`}
                accessible={true}
                key={p.id || index}
                onPress={() => (updateParticipants ?? addParticipantsToOrder)(p)}
                onLongPress={() => handleLongPress(p)}
                style={[styles.BlockParticipant, { marginRight: 10 }]}
              >
                <Image style={styles.BlockParticipantAvatar} source={{ uri: `${p.photoURL}` }} />
                <Text style={styles.BlockParticipantName} numberOfLines={1}>
                  {p.nikname || "No nikname"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  Repair: {
    width: "100%",
    flexDirection: "row",
  },
  BlockIcon: {
    height: 70,
    width: 70,
    borderWidth: 2,
    borderColor: colors.APBorderColor,
    alignSelf: "center",
    borderRadius: 100,
    marginRight: "1%",
    justifyContent: "center",
    alignItems: "center",
  },
  BlockParticipant: {
    height: "100%",
    justifyContent: "center",
    width: 60,
  },
  BlockParticipantAvatar: {
    borderRadius: 100,
    aspectRatio: 1,
    resizeMode: "cover",
  },
  BlockParticipantName: {
    color: colors.APBorderColor,
    fontSize: 12,
    width: "100%",
    height: 20,
    textAlign: "center",
  },
  ModalDelParticipant: {
    width: "100%",
    height: "100%",
    padding: "2%",
    backgroundColor: colors.orderBackgroundColor,
    position: "absolute",
    zIndex: 5,
  },
  ModalDelParticipantText: {
    width: "100%",
    padding: "2%",
    backgroundColor: colors.orderBackgroundColor,
    color: colors.titleText,
    textAlign: "center",
  },
  ModalButton: {
    width: "100%",
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: "1%",
  },
  ModalButtonBtn: {
    width: "25%",
    height: "100%",
  },
  BlockNoOne: {
    flexDirection: "row",
  },
  BlockNoOneIcon: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: colors.APBorderColor,
    alignSelf: "center",
    borderRadius: 100,
    marginRight: "1%",
    justifyContent: "center",
    alignItems: "center",
  },
});
