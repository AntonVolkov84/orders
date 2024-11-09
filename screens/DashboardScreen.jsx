import { View, Text, TouchableOpacity, Image, TextInput, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
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

const BlockOrderIcon = styled.TouchableOpacity`
  width: 20%;
  aspect-ratio: 1;
  border-radius: 100px;
  overflow: hidden;
  position: absolute;
  bottom: 8%;
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
  width: 100%;
  height: 150px;
  padding-left: 3%;
  padding-right: 3%;
`;
const BlockAddingOrder = styled.View`
  width: 100%;
  height: 100% - 150px;
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

export default function DashboardScreen({ navigation }) {
  const [createOrderModal, setCreateOrderModal] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [fetchedOrders, setFetchedOrders] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const currentEmail = auth.currentUser.email;

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

  useEffect(() => {});

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
                <SafeAreaView style={{ height: "100%" }}>
                  <FlatList
                    data={fetchedOrders}
                    renderItem={({ item }) => <OrdersDashboard item={item} navigation={navigation} />}
                    keyExtractor={(item) => item.orderId}
                  />
                </SafeAreaView>
              </SafeAreaProvider>
            ) : null}
          </BlockOrdersShow>
          <BlockOrderIcon onPress={() => setCreateOrderModal(true)}>
            <OrderIcon />
          </BlockOrderIcon>
        </>
      )}
    </LinearGradient>
  );
}
