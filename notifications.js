import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

export async function sendPushNotification(expoPushToken, bodyText) {
  if (!expoPushToken) {
    console.warn("Отправка пуша отменена: нет expoPushToken");
    return;
  }
  try {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "Startling",
      body: bodyText,
      data: { someData: "goes here" },
      largeIcon: require("./assets/smileWithHand.png"),
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.log("sendPushNotification", error.message);
  }
}

export async function registerForPushNotificationsAsync() {
  try {
    let token;
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  } catch (error) {
    console.log("registerForPushNotificationsAsync", error.message);
  }
}
