import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RegistrationScreen from "./screens/RegistrationScreen";
import LoginScreen from "./screens/LoginScreen";
import { useState, createContext, useEffect, useRef } from "react";
import DashboardScreen from "./screens/DashboardScreen.jsx";
import { onAuthStateChanged } from "firebase/auth";
import OrderScreen from "./screens/OrderScreen.jsx";
import MessagingScreen from "./screens/MessagingScreen.jsx";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "./notifications.js";
import mobileAds from "react-native-google-mobile-ads";
import { auth } from "./firebaseConfig.js";
import { syncPublicKeyWithFirestore } from "./crypto/syncKeys.js";

mobileAds()
  .initialize()
  .then((adapterStatuses) => {
    console.log(adapterStatuses);
  });

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
const Stack = createNativeStackNavigator();
export const AppContext = createContext(null);

export default function App() {
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [expoPushToken, setExpoPushToken] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        setUser(user);
        try {
          await syncPublicKeyWithFirestore(user.email);
        } catch (err) {
          console.warn("Не удалось синхронизировать ключи:", err);
        }
      } else {
        setUser("");
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token))
      .catch((error) => {
        console.log("ExpoNotification in App.js", error);
      });
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  if (!user) {
    return (
      <NavigationContainer>
        <AppContext.Provider value={{ user, expoPushToken }}>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: false,
                animation: "none",
              }}
            />
            <Stack.Screen
              name="Registration"
              component={RegistrationScreen}
              options={{
                headerShown: false,
                animation: "none",
              }}
            />
          </Stack.Navigator>
        </AppContext.Provider>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <AppContext.Provider value={{ user, expoPushToken }}>
        <Stack.Navigator initialRouteName="Dashboard">
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              headerShown: false,
              animation: "none",
            }}
          />
          <Stack.Screen
            name="OrderScreen"
            component={OrderScreen}
            options={{
              headerShown: false,
              animation: "none",
            }}
          />
          <Stack.Screen
            name="Messaging"
            component={MessagingScreen}
            options={{
              headerShown: false,
              animation: "none",
            }}
          />
        </Stack.Navigator>
      </AppContext.Provider>
    </NavigationContainer>
  );
}
