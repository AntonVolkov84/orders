import { View, Text, TouchableOpacity, Image, TextInput, FlatList } from "react-native";
import React, { useState, useEffect, useContext, memo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as colors from "../variables/colors";
import { StatusBar } from "expo-status-bar";
import Proffile from "../components/Proffile";
import OrderIcon from "../components/OrderIcon";
import CreatingOrder from "../components/CreatingOrder";
import AddingParticipant from "../components/AddingParticipant";
import styled from "styled-components";
import { db, auth } from "../firebaseConfig";
import { collection, onSnapshot, where, orderBy, query, getDocs } from "firebase/firestore";
import OrdersDashboard from "../components/OrdersDashboard";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { AppContext } from "../App";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { Dimensions } from "react-native";

const screenHeight = Dimensions.get("screen").height;

const BlockOrderIcon = styled.TouchableOpacity`
  width: 20%;
  aspect-ratio: 1;
  border-radius: 100px;
  overflow: hidden;
  position: absolute;
  bottom: ${screenHeight < 760 ? "11%" : "9%"};
  right: 8%;
`;
const BlockOrderCreate = styled.View`
  width: 100%;
  height: 100%;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding-top: 3%;
  background-color: ${colors.blockOrderCreateBackgroundColor};
`;
const BlockAddingParticipant = styled.View`
  height: ${screenHeight < 760 ? "80px" : "100px"};
  padding-left: 1%;
  padding-right: 1%;
`;
const BlockAddingOrder = styled.View`
  width: 100%;
  height: ${screenHeight < 760 ? "80%" : "100%"};
  margin-bottom: 1%;
  padding-left: 3%;
  padding-right: 3%;
`;
const BlockOrdersShow = styled.View`
  height: 90%;
  width: 98%;
  margin-left: 1%;
  margin-right: 1%;
  margin-top: 1%;
`;
export default memo(function DashboardScreen({ navigation }) {
  const [createOrderModal, setCreateOrderModal] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [fetchedOrders, setFetchedOrders] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const currentEmail = auth.currentUser.email;
  const sendPushNotification = useContext(AppContext);

  useEffect(() => {
    onSnapshot(
      query(
        collection(db, "orders"),
        where("participants", "array-contains", currentEmail),
        orderBy("dateForOrder", "desc")
      ),
      (snapshot) => {
        setFetchedOrders(snapshot.docs.map((doc) => ({ docId: doc.id, ...doc.data() })));
        setIsLoaded(true);
      }
    );
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
      style={{ height: "100%", width: "100%", paddingTop: "10%" }}
    >
      <StatusBar style="light" />
      {createOrderModal ? (
        <>
          <BlockOrderCreate>
            <BlockAddingParticipant>
              <AddingParticipant participants={participants} setParticipants={setParticipants} />
            </BlockAddingParticipant>
            <BlockAddingOrder>
              <CreatingOrder
                sendPushNotification={sendPushNotification}
                participants={participants}
                setParticipants={setParticipants}
                setCreateOrderModal={setCreateOrderModal}
              />
            </BlockAddingOrder>
          </BlockOrderCreate>
        </>
      ) : (
        <>
          <Proffile />
          <BlockOrdersShow>
            {isLoaded ? (
              <SafeAreaProvider>
                <SafeAreaView style={{ height: "94%" }}>
                  <FlatList
                    data={fetchedOrders}
                    renderItem={({ item }) => <OrdersDashboard item={item} navigation={navigation} />}
                    keyExtractor={(item) => item.orderId}
                  />
                </SafeAreaView>
              </SafeAreaProvider>
            ) : null}
          </BlockOrdersShow>
          <BlockOrderIcon
            onPress={() => {
              setCreateOrderModal(true);
            }}
          >
            <OrderIcon />
          </BlockOrderIcon>
        </>
      )}
      <View style={{ position: "absolute", bottom: 0, paddingleft: "1%" }}>
        <BannerAd
          unitId="ca-app-pub-3940256099942544/6300978111"
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
            networkExtras: {
              collapsible: "bottom",
            },
          }}
        />
      </View>
    </LinearGradient>
  );
});
