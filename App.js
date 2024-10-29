import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RegistrationScreen from "./screens/RegistrationScreen";
import LoginScreen from "./screens/LoginScreen";
import { useState, createContext } from "react";
import DashboardScreen from "./screens/DashboardScreen.jsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import OrderScreen from "./screens/OrderScreen.jsx";

const Stack = createNativeStackNavigator();
export const AppContext = createContext(null);

export default function App() {
  const [user, setUser] = useState("");
  const [participants, setParticipants] = useState("");
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user && auth.currentUser.emailVerified) {
      setUser(user);
    } else {
      setUser("");
    }
  });

  if (!user) {
    return (
      <NavigationContainer>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
