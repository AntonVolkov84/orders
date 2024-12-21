import { StyleSheet, Alert, Text, View, AppRegistry } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RegistrationScreen from "./screens/RegistrationScreen";
import LoginScreen from "./screens/LoginScreen";
import { useState, createContext, useEffect, useRef } from "react";
import DashboardScreen from "./screens/DashboardScreen.jsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import OrderScreen from "./screens/OrderScreen.jsx";
import MessagingScreen from "./screens/MessagingScreen.jsx";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "./notifications.js";
import messaging from "@react-native-firebase/messaging";
import { Dimensions } from "react-native";

const windowHeight = Dimensions.get("screen").height;
export const coefficientOfScreen = windowHeight / 910;

const Stack = createNativeStackNavigator();
export const AppContext = createContext(null);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
async function sendPushNotification(message) {
  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

export default function App() {
  const [user, setUser] = useState("");
  const auth = getAuth();
  const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [expoPushToken, setExpoPushToken] = useState("");

  onAuthStateChanged(auth, (user) => {
    if (user && auth.currentUser.emailVerified) {
      setUser(user);
    } else {
      setUser("");
    }
  });
  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error) => setExpoPushToken(`${error}`));

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });
    messaging()
      .getInitialNotification()
      .then(async (remoteMessage) => {
        if (remoteMessage) {
          console.log("Notify from app to quite state", remoteMessage.notification);
        }
      });
    messaging().onNotificationOpenedApp((removeMessage) => {
      console.log("Notification caused app to open", removeMessage.notification);
    });
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Message handled in the background!", remoteMessage);
    });
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert(JSON.stringify(remoteMessage.data.title, remoteMessage.data.message));
    });

    return () => {
      notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);
      unsubscribe;
    };
  }, []);

  if (!user) {
    return (
      <NavigationContainer>
        <AppContext.Provider value={expoPushToken}>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Registration"
              component={RegistrationScreen}
              options={{
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </AppContext.Provider>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <AppContext.Provider value={sendPushNotification}>
        <Stack.Navigator initialRouteName="Dashboard">
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="OrderScreen"
            component={OrderScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Messaging"
            component={MessagingScreen}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </AppContext.Provider>
    </NavigationContainer>
  );
}
