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
import mobileAds from "react-native-google-mobile-ads";

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
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token));
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
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
    </NavigationContainer>
  );
}
