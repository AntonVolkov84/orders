import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Dimensions,
  Alert,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import Button from "../components/Button";
import * as colors from "../variables/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebaseConfig";

const screenHeight = Dimensions.get("screen").height;

export default function ModalAddNewPosition({ currentUserEmail, documentId, setDataItem, setModalAddPosition }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");

  const updateOrder = async () => {
    try {
      if (!name || !quantity) {
        return Alert.alert(`${t("OrderScreenAlertEmptyField")}`);
      }

      const updatingOrder = {
        id: Date.parse(new Date()),
        made: false,
        madeBy: currentUserEmail,
        name,
        quantity,
      };

      const firebaseRef = doc(db, "orders", documentId);

      await updateDoc(firebaseRef, {
        order: arrayUnion(updatingOrder),
      });

      if (dataItem) {
        await updateDoc(firebaseRef, {
          order: arrayRemove(dataItem),
        });
      }

      setModalAddPosition(false);
      setName("");
      setQuantity("");
    } catch (error) {
      console.log("updateDoc", error.message);
    }
  };

  const clearInputs = () => {
    setName("");
    setQuantity("");
    setDataItem(null);
  };

  return (
    <View style={styles.modalBlockAddNew}>
      <LinearGradient
        colors={[
          colors.startColorForGradient,
          colors.endColorForGradient,
          colors.startColorForGradient,
          colors.endColorForGradient,
        ]}
        start={{ x: 0.0, y: 0.0 }}
        end={{ x: 1.0, y: 1.0 }}
        style={styles.gradient}
      >
        <View style={styles.modalBlockAddNewInput}>
          <TextInput
            style={styles.inputFieldName}
            onChangeText={setName}
            maxLength={25}
            value={name}
            placeholder={t("OrderScreenModalPlaceholderItem")}
          />
          <TextInput
            style={styles.inputFieldQuantity}
            onChangeText={setQuantity}
            value={quantity}
            maxLength={7}
            placeholder={t("OrderScreenModalPlaceholderQT")}
          />
        </View>

        <View style={styles.modalBlockBtn}>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setModalAddPosition(false);
              clearInputs();
            }}
          >
            <Button children={t("ProffileCancel")} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              updateOrder();
              setModalAddPosition(false);
              clearInputs();
            }}
          >
            <Button children={t("OrderScreenModalAddPosition")} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBlockAddNew: {
    width: "100%",
    height: "95%",
    position: "absolute",
    paddingLeft: "1%",
    paddingRight: "1%",
  },
  gradient: {
    height: "100%",
    width: "100%",
    paddingTop: "5%",
  },
  modalBlockAddNewInput: {
    width: "100%",
    marginTop: "38%",
    height: screenHeight < 760 ? 180 : 200,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  inputFieldName: {
    width: "70%",
    height: screenHeight < 760 ? 50 : 70,
    backgroundColor: colors.orderScreenModalInputBackgroung,
    borderRadius: 18,
    paddingLeft: "2%",
    fontSize: screenHeight < 760 ? 15 : 20,
  },
  inputFieldQuantity: {
    width: "25%",
    height: screenHeight < 760 ? 50 : 70,
    backgroundColor: colors.orderScreenModalInputBackgroung,
    marginLeft: "5%",
    borderRadius: 12,
    fontSize: screenHeight < 760 ? 15 : 20,
    textAlign: "center",
  },
  modalButton: {
    width: "30%",
    height: screenHeight < 760 ? 50 : 60,
  },
  modalBlockBtn: {
    width: "100%",
    height: screenHeight < 760 ? 50 : 70,
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
