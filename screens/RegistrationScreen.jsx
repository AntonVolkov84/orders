import { View, Alert, Text, TextInput, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { useState, useEffect, useContext } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as colors from "../variables/colors";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { db, auth } from "../firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { signOut, sendEmailVerification, createUserWithEmailAndPassword } from "firebase/auth";
import { AppContext } from "../App.js";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const screenHeight = Dimensions.get("screen").height;

const styles = StyleSheet.create({
  titleText: {
    fontSize: screenHeight < 760 ? 30 : 40,
    color: colors.titleText,
    alignSelf: "center",
    marginTop: "5%",
  },
  blockInput: {
    width: "100%",
    marginTop: "10%",
  },
  inputField: {
    width: "80%",
    height: screenHeight < 760 ? 50 : 70,
    marginTop: "5%",
    paddingLeft: "5%",
    marginLeft: "10%",
    borderRadius: 10,
    backgroundColor: colors.backgroundColorInput,
    color: colors.colorTextInput,
    fontSize: screenHeight < 760 ? 15 : 20,
  },
  inputFieldPasswordBlock: {
    width: "80%",
    height: screenHeight < 760 ? 50 : 70,
    marginTop: "5%",
    paddingLeft: "5%",
    marginLeft: "10%",
    borderRadius: 10,
    backgroundColor: colors.backgroundColorInput,
    position: "relative",
    justifyContent: "center",
  },
  inputFieldPassword: {
    width: "100%",
    height: "100%",
    color: colors.colorTextInput,
    fontSize: screenHeight < 760 ? 15 : 20,
  },
  eye: {
    position: "absolute",
    right: 10,
    top: screenHeight < 760 ? 12 : 22,
    justifyContent: "center",
    alignItems: "center",
  },
  registerButton: {
    width: 160,
    height: screenHeight < 760 ? 50 : 70,
    borderRadius: 50,
    alignSelf: "center",
    marginTop: "15%",
  },
  registerButtonText: {
    color: colors.buttonRegistrationColor,
    fontSize: screenHeight < 760 ? 15 : 20,
  },
});

export default function RegistrationScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nikname, setNikname] = useState("");
  const [secureText, setSecureText] = useState(true);
  const expoPushToken = useContext(AppContext);

  const addToUsers = async (userId) => {
    const emailInLowerCase = email.toLowerCase();
    try {
      const user = {
        language: "en",
        displayName: "",
        timestamp: serverTimestamp(),
        nikname: nikname,
        photoURL:
          "https://firebasestorage.googleapis.com/v0/b/orders-78c1c.appspot.com/o/avatar%2FComponent%203.png?alt=media&token=9365bf71-bcfd-44d3-adb5-28bdbf7e0bf4",
        email: emailInLowerCase,
        userId: userId,
        file: "",
        pushToken: expoPushToken,
      };
      await setDoc(doc(db, "users", emailInLowerCase), user);
    } catch (error) {
      console.log("add to users", error);
    }
  };

  const handleRegister = (email, password) => {
    if (password.length < 6) {
      return Alert.alert("Your password should be no less then 6 symbols");
    }
    if (nikname.length < 1) {
      return Alert.alert("Your nikname should be no less then 1 symbols");
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const userId = user.uid;
        if (user.uid) {
          addToUsers(userId);
          sendEmailVerification(auth.currentUser)
            .then(() => {
              Alert.alert("You may received a mail with link for authorization");
            })
            .then(() => {
              signOut(auth);
            })
            .then(() => {
              navigation.navigate("Login");
            })
            .catch((error) => {
              if (error.code === "auth/too-many-requests") {
                Alert.alert("Слишком много запросов", "Подождите перед повторной отправкой письма.");
              } else if (error.code === "auth/user-not-found") {
                Alert.alert("Пользователь не найден", "Проверьте email.");
              } else {
                Alert.alert("Ошибка", error.message);
              }
            });
          navigation.navigate("Login");
        }
      })
      .catch((error) => {
        console.log("handleRegister", error);
      });
  };

  const customNavigationBar = async () => {
    await NavigationBar.setBackgroundColorAsync("#1E2322");
    await NavigationBar.setButtonStyleAsync("light");
  };

  useEffect(() => {
    customNavigationBar();
  }, []);

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
      style={{ height: "100%", width: "100%", paddingTop: "5%" }}
    >
      <StatusBar style="light" />
      <Text style={styles.titleText}>Registration</Text>

      <View style={styles.blockInput}>
        <TextInput
          style={styles.inputField}
          inputMode="email"
          keyboardType="email-address"
          placeholder="Type your email"
          onChangeText={setEmail}
        />

        <View style={styles.inputFieldPasswordBlock}>
          <TextInput
            style={styles.inputFieldPassword}
            secureTextEntry={secureText}
            placeholder="Type your password"
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.eye} onPress={() => setSecureText(!secureText)}>
            <FontAwesome6
              name={secureText ? "eye" : "eye-slash"}
              size={screenHeight < 760 ? 15 : 28}
              color={colors.placeolderColor}
            />
          </TouchableOpacity>
        </View>

        <TextInput style={styles.inputField} placeholder="Type your nikname" onChangeText={setNikname} />
      </View>

      <TouchableOpacity style={styles.registerButton} onPress={() => handleRegister(email, password)}>
        <LinearGradient
          colors={[colors.buttonStartColorForGradient, colors.buttonEndColorForGradient]}
          start={{ x: 0.0, y: 0.0 }}
          end={{ x: 1.0, y: 1.0 }}
          style={{
            height: "100%",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 50,
          }}
        >
          <Text style={styles.registerButtonText}>Registration</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}
