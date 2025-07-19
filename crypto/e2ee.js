import "react-native-get-random-values";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PUBLIC_KEY_STORAGE = "@e2ee_public_key";
const PRIVATE_KEY_STORAGE = "@e2ee_private_key";

export const generateKeyPairIfNeeded = async () => {
  const existingPub = await AsyncStorage.getItem(PUBLIC_KEY_STORAGE);
  const existingPriv = await AsyncStorage.getItem(PRIVATE_KEY_STORAGE);
  if (existingPub && existingPriv) {
    return {
      publicKey: naclUtil.decodeBase64(existingPub),
      privateKey: naclUtil.decodeBase64(existingPriv),
    };
  }

  const keyPair = nacl.box.keyPair();

  await AsyncStorage.setItem(PUBLIC_KEY_STORAGE, naclUtil.encodeBase64(keyPair.publicKey));
  await AsyncStorage.setItem(PRIVATE_KEY_STORAGE, naclUtil.encodeBase64(keyPair.secretKey));

  return keyPair;
};
export const getEncodedPublicKey = async () => {
  const keyPair = await generateKeyPairIfNeeded();
  return naclUtil.encodeBase64(keyPair.publicKey);
};
export const getStoredKeyPair = async () => {
  const pub = await AsyncStorage.getItem(PUBLIC_KEY_STORAGE);
  const priv = await AsyncStorage.getItem(PRIVATE_KEY_STORAGE);
  if (!pub || !priv) throw new Error("Keys not found");
  return {
    publicKey: naclUtil.decodeBase64(pub),
    privateKey: naclUtil.decodeBase64(priv),
  };
};

export const encryptMessage = (message, theirPublicKey, myPrivateKey) => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageUint8 = naclUtil.decodeUTF8(message);
  const encrypted = nacl.box(messageUint8, nonce, theirPublicKey, myPrivateKey);

  return {
    ciphertext: naclUtil.encodeBase64(encrypted),
    nonce: naclUtil.encodeBase64(nonce),
  };
};

export const decryptMessage = (ciphertextUint8, nonceUint8, privateKeyUint8, senderPublicKeyUint8) => {
  const decrypted = nacl.box.open(ciphertextUint8, nonceUint8, senderPublicKeyUint8, privateKeyUint8);

  if (!decrypted) throw new Error("Не удалось расшифровать сообщение");

  return naclUtil.encodeUTF8(decrypted);
};

export const exportPublicKeyBase64 = async () => {
  const pair = await getStoredKeyPair();
  return naclUtil.encodeBase64(pair.publicKey);
};
