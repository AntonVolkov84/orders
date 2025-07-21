import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import { db } from "../firebaseConfig";

const PUBLIC_KEY_STORAGE = "@e2ee_public_key";
const PRIVATE_KEY_STORAGE = "@e2ee_private_key";

export const syncPublicKeyWithFirestore = async (userEmail) => {
  const localPub = await AsyncStorage.getItem(PUBLIC_KEY_STORAGE);
  const localPriv = await AsyncStorage.getItem(PRIVATE_KEY_STORAGE);
  const userRef = doc(db, "users", userEmail);
  const userSnap = await getDoc(userRef);
  const remotePub = userSnap.exists() ? userSnap.data().publicKey : null;
  if (!localPub || !localPriv || localPub !== remotePub) {
    const keyPair = nacl.box.keyPair();
    const encodedPub = naclUtil.encodeBase64(keyPair.publicKey);
    const encodedPriv = naclUtil.encodeBase64(keyPair.secretKey);
    await AsyncStorage.setItem(PUBLIC_KEY_STORAGE, encodedPub);
    await AsyncStorage.setItem(PRIVATE_KEY_STORAGE, encodedPriv);
    await updateDoc(userRef, { publicKey: encodedPub });
    console.warn("🔐 Ключи синхронизированы. Старые сообщения, скорее всего, недоступны.");
  }
};
