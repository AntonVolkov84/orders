import { View, Alert, Text, TouchableOpacity, TextInput, StyleSheet, Dimensions } from "react-native";
import { useState, useEffect, useContext, memo } from "react";
import { getAuth, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import * as colors from "../variables/colors.js";
import { GoogleSignin, GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { db } from "../firebaseConfig";
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";
import { AppContext } from "../App.js";

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
  loginButton: {
    width: 150,
    height: screenHeight < 760 ? 50 : 70,
    borderRadius: 50,
    alignSelf: "center",
    marginTop: "15%",
  },
  loginButtonGradient: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },
  loginButtonText: {
    color: colors.titleText,
    fontSize: screenHeight < 760 ? 20 : 25,
  },
  buttonRegistration: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: "15%",
  },
  buttonRegistrationText: {
    fontSize: screenHeight < 760 ? 25 : 30,
    color: colors.buttonRegistrationColor,
  },
  buttonGoogle: {
    width: 300,
    height: screenHeight < 760 ? 50 : 70,
    borderRadius: 15,
    alignSelf: "center",
    marginTop: "5%",
  },
});

export default memo(function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = getAuth();
  const expoPushToken = useContext(AppContext);

  const loginUser = () => {
    signInWithEmailAndPassword(auth, email, password)
      .catch((error) => {
        console.log("error in loginUser", error.code, error.message);
        Alert.alert("Wrong email or password");
      })
      .then(async () => {
        if (!auth.currentUser.emailVerified) {
          Alert.alert("Mail is not Verified");
          logOut();
        }
        const firebaseRef = doc(db, "users", email);
        await updateDoc(firebaseRef, {
          pushToken: expoPushToken,
        });
      });
  };

  const addToUsers = async (nikname, photoURL, email, userId, displayName) => {
    try {
      const user = {
        language: "en",
        timestamp: serverTimestamp(),
        nikname: nikname,
        photoURL: photoURL,
        email: email,
        userId: userId,
        pushToken: expoPushToken,
        displayName: displayName || "",
      };
      await setDoc(doc(db, "users", email), user);
    } catch (error) {
      console.log("add to users", error);
    }
  };

  const customNavigationBar = async () => {
    await NavigationBar.setBackgroundColorAsync("#1E2322");
    await NavigationBar.setButtonStyleAsync("light");
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "604190082036-2hogegaj8kj52vmqj0uo975d3hfgklg5.apps.googleusercontent.com",
    });
    customNavigationBar();
  }, []);

  const signin = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const user = await GoogleSignin.signIn();
      const idToken = user.data.idToken;
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const docSnap = await getDoc(doc(db, "users", user.data.user.email));

      if (docSnap.exists()) {
        const firebaseRef = doc(db, "users", user.data.user.email);
        await updateDoc(firebaseRef, {
          pushToken: expoPushToken,
        });
        signInWithCredential(auth, googleCredential);
      } else {
        signInWithCredential(auth, googleCredential).then((result) => {
          const currentUser = result.user;
          const nikname = result._tokenResponse.firstName;
          const photoURL = currentUser.photoURL;
          const email = currentUser.email;
          const userId = currentUser.uid;
          const displayName = currentUser.displayName;
          addToUsers(nikname, photoURL, email, userId, displayName);
        });
      }
    } catch (error) {
      console.log("signin", error);
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
      style={{ height: "100%", width: "100%", paddingTop: "5%" }}
    >
      <StatusBar style="light" />
      <Text style={styles.titleText}>Login</Text>

      <View style={styles.blockInput}>
        <TextInput
          style={styles.inputField}
          inputMode={email}
          keyboardType={email}
          placeholder="Type your email"
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.inputField}
          secureTextEntry={true}
          placeholder="Type your password"
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.loginButton}>
        <LinearGradient
          colors={[colors.buttonStartColorForGradient, colors.buttonEndColorForGradient]}
          start={{ x: 0.0, y: 0.0 }}
          end={{ x: 1.0, y: 1.0 }}
          style={styles.loginButtonGradient}
        >
          <Text style={styles.loginButtonText} onPress={() => loginUser(email, password)}>
            Login
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonGoogle}>
        <GoogleSigninButton
          style={{
            justifySelf: "center",
            alignSelf: "center",
            marginTop: "10%",
            width: "100%",
            height: "100%",
          }}
          onPress={signin}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonRegistration} onPress={() => navigation.navigate("Registration")}>
        <Text style={styles.buttonRegistrationText}>Registration</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
});
