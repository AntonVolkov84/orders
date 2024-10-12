import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RegistrationScreen from "./screens/RegistrationScreen";
import LoginScreen from "./screens/LoginScreen";
import { useState } from "react";
import DashboardScreen from "./screens/DashboardScreen.jsx";

const Stack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(false);
  const [user, setUser] = useState();

  if (initializing) {
    return null;
  }
  if (!user) {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Registration">
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
