import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useState, useEffect, memo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as colors from "../variables/colors";
import { StatusBar } from "expo-status-bar";
import Proffile from "../components/Proffile";
import OrderIcon from "../components/OrderIcon";
import CreatingOrder from "../components/CreatingOrder";
import AddingParticipant from "../components/AddingParticipant";
import { db, auth } from "../firebaseConfig";
import { collection, onSnapshot, where, orderBy, query, getDocs } from "firebase/firestore";
import OrdersDashboard from "../components/OrdersDashboard";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Dimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

const screenHeight = Dimensions.get("screen").height;

export default memo(function DashboardScreen({ navigation }) {
  const [createOrderModal, setCreateOrderModal] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [fetchedOrders, setFetchedOrders] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const currentEmail = auth.currentUser.email;
  const { t } = useTranslation();

  useEffect(() => {
    const unsub = onSnapshot(
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
    return () => {
      unsub();
    };
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
        <View style={styles.blockOrderCreate}>
          <View style={styles.blockAddingParticipant}>
            <AddingParticipant participants={participants} setParticipants={setParticipants} />
          </View>
          <View style={styles.blockAddingOrder}>
            <CreatingOrder
              participants={participants}
              setParticipants={setParticipants}
              setCreateOrderModal={setCreateOrderModal}
            />
          </View>
        </View>
      ) : (
        <>
          <Proffile />
          <View
            style={styles.blockOrdersShow}
            accessibilityLabel="Block with all orders where you are participant"
            accessible={true}
          >
            {fetchedOrders.length === 0 && (
              <View style={styles.noOrder}>
                <Text style={styles.noOrderText}>{t("OrderDashboardNoOrderText")}</Text>
              </View>
            )}
            {isLoaded && (
              <SafeAreaProvider>
                <SafeAreaView style={{ height: "94%" }}>
                  <FlatList
                    data={fetchedOrders}
                    renderItem={({ item }) => <OrdersDashboard item={item} navigation={navigation} />}
                    keyExtractor={(item) => item.orderId}
                  />
                </SafeAreaView>
              </SafeAreaProvider>
            )}
          </View>
          <TouchableOpacity
            style={styles.blockOrderIcon}
            onPress={() => {
              setCreateOrderModal(true);
            }}
          >
            <OrderIcon />
          </TouchableOpacity>
        </>
      )}
      <View style={{ position: "absolute", bottom: 0, paddingleft: "1%", zIndex: 10 }}>
        <BannerAd
          unitId="ca-app-pub-9267417700367649/6433322697"
          onAdFailedToLoad={(error) => console.log(error)}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </View>
    </LinearGradient>
  );
});
const styles = StyleSheet.create({
  blockOrderIcon: {
    width: "20%",
    aspectRatio: 1,
    borderRadius: 100,
    overflow: "hidden",
    position: "absolute",
    bottom: screenHeight < 760 ? "11%" : "9%",
    right: "8%",
  },
  blockOrderCreate: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: "3%",
    backgroundColor: colors.blockOrderCreateBackgroundColor,
  },
  blockAddingParticipant: {
    height: screenHeight < 760 ? 80 : 100,
    paddingLeft: "1%",
    paddingRight: "1%",
  },
  blockAddingOrder: {
    width: "100%",
    height: screenHeight < 760 ? "80%" : "100%",
    marginBottom: "1%",
    paddingLeft: "3%",
    paddingRight: "3%",
  },
  blockOrdersShow: {
    height: "90%",
    width: "98%",
    marginLeft: "1%",
    marginRight: "1%",
    marginTop: "1%",
  },
  noOrder: {
    width: "100%",
    marginTop: 100,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  noOrderText: {
    fontSize: screenHeight < 760 ? 15 : 20,
    textAlign: "center",
    color: colors.titleText,
  },
});
