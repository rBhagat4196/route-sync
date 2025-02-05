import { useUser } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GoogleTextInput from "@/components/GoogleTextInput";
import Map from "@/components/Map";
import RideCard from "@/components/RideCard";
import { icons, images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { Ride } from "@/types/type";
import React from "react";

const Home = () => {
  const { user } = useUser();
  const { signOut } = useAuth();

  const { setUserLocation, setDestinationLocation, userLocation } = useLocationStore();

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isAutoMode, setIsAutoMode] = useState<boolean>(false);
  const [autoList, setAutoList] = useState([
    { id: "1", route: "Sharda University", waitingTime: 5, seatsAvailable: 3, rating: 4.5, status: "Available" },
    { id: "2", route: "Jagat Farm", waitingTime: 10, seatsAvailable: 2, rating: 4.2, status: "Available" },
    { id: "3", route: "Pari Chowk Metro", waitingTime: 7, seatsAvailable: 4, rating: 4.7, status: "Available" },
  ]);

  const {
    data: recentRides,
    loading,
    error,
  } = useFetch<Ride[]>(`/(api)/ride/${user?.id}`);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Please enable location services to use this app.");
        setHasPermission(false);
        return;
      }

      setHasPermission(true);

      let location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      });

      setUserLocation({
        latitude: location.coords?.latitude,
        longitude: location.coords?.longitude,
        address: `${address[0].name}, ${address[0].region}`,
      });

      const locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 10000, distanceInterval: 10 },
        (newLocation) => {
          setUserLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            address: `${address[0].name}, ${address[0].region}`,
          });
        }
      );

      return () => {
        if (locationSubscription) {
          locationSubscription.remove();
        }
      };
    })();
  }, []);

  const handleDestinationPress = (location: { latitude: number; longitude: number; address: string }) => {
    setDestinationLocation(location);
    router.push("/(root)/find-ride");
  };

  const toggleAutoMode = () => {
    setIsAutoMode(!isAutoMode);
  };

  const handleAutoSelection = (selectedAuto) => {
    Alert.alert(
      "Confirm Booking",
      `Do you want to book this auto on ${selectedAuto.route}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book",
          onPress: () => {
            Alert.alert("Booking Confirmed", `You have booked ${selectedAuto.route}`);

            setAutoList((prevAutoList) =>
              prevAutoList.map((auto) =>
                auto.id === selectedAuto.id
                  ? { ...auto, status: "Booked", remainingTime: auto.waitingTime * 60 }
                  : auto
              )
            );

            const countdown = setInterval(() => {
              setAutoList((prevAutoList) =>
                prevAutoList.map((auto) => {
                  if (auto.id === selectedAuto.id && auto.status === "Booked") {
                    if (auto.remainingTime <= 0) {
                      clearInterval(countdown);
                      return { ...auto, status: "Available", remainingTime: 0 };
                    } else {
                      return { ...auto, remainingTime: auto.remainingTime - 1 };
                    }
                  }
                  return auto;
                })
              );
            }, 1000);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="bg-general-500">
      <FlatList
        data={recentRides?.slice(0, 5)}
        renderItem={({ item }) => <RideCard ride={item} />}
        keyExtractor={(item, index) => index.toString()}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image source={images.noResult} className="w-40 h-40" alt="No recent rides found" resizeMode="contain" />
                <Text className="text-sm">No recent rides found</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <View className="flex flex-row items-center justify-between my-5">
              <Text className="text-2xl font-JakartaExtraBold">Welcome {user?.firstName}👋</Text>
              <TouchableOpacity onPress={handleSignOut} className="justify-center items-center w-10 h-10 rounded-full bg-white">
                <Image source={icons.out} className="w-4 h-4" />
              </TouchableOpacity>
            </View>

            <GoogleTextInput icon={icons.search} containerStyle="bg-white shadow-md shadow-neutral-300" handlePress={handleDestinationPress} />

            <Text className="text-xl font-JakartaBold mt-5 mb-3">Your current location</Text>
            <View className="flex flex-row items-center bg-transparent h-[300px]">
              <Map />
            </View>

            <TouchableOpacity onPress={toggleAutoMode} className="bg-blue-500 py-2 px-5 rounded-full my-5">
              <Text className="text-white font-bold">{isAutoMode ? "Switch to Cab" : "Switch to Auto Mode"}</Text>
            </TouchableOpacity>

            {isAutoMode ? (
              <FlatList
                data={autoList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleAutoSelection(item)}
                    className={`p-3 rounded-lg mb-2 ${item.status === "Booked" ? "bg-yellow-300" : "bg-gray-100"}`}
                  >
                    <Text className="text-lg font-JakartaBold">Route: {item.route}</Text>
                    <Text>Waiting Time: {item.status === "Booked" ? `${Math.floor(item.remainingTime / 60)} min ${item.remainingTime % 60} sec` : `${item.waitingTime} mins`}</Text>
                    <Text>Seats Available: {item.seatsAvailable}</Text>
                    <Text>Rating: {item.rating}</Text>
                    <Text>Status: {item.status}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
              />
            ) : (
              <Text className="text-lg font-JakartaBold">Cab Mode Active</Text>
            )}

            <Text className="text-xl font-JakartaBold mt-5 mb-3">Recent Rides</Text>
          </>
        }
      />
    </SafeAreaView>
  );
};

export default Home;
