import { Image, ScrollView, Text, View, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFetch } from "@/lib/fetch";
import { Ride } from "@/types/type";
import { images } from "@/constants";
import { useUser } from "@clerk/clerk-expo";
import { useState } from "react";

const Chat = () => {
  const { user } = useUser();

  const {
    data: recentRides,
    loading,
    error,
  } = useFetch<Ride[]>(`/(api)/ride/${user?.id}`);

  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Rider', message: 'Hey, I am on my way to the pickup location!' },
    { sender: 'Knight', message: 'Great! I’ll be there in 5 minutes.' },
    { sender: 'Rider', message: 'Awesome, see you soon!' },
    { sender: 'Knight', message: 'Looking forward to it. Safe travels!' }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatMessages([...chatMessages, { sender: 'Rider', message }]);
      setMessage(""); // Clear the input after sending
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white p-5">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Text className="text-2xl font-JakartaBold">Loading...</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white p-5">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Text className="text-2xl font-JakartaBold">Error: {error.message}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Safely get the first ride
  const firstRide = recentRides && recentRides[0];

  return (
    <SafeAreaView className="flex-1 bg-white p-5">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <Text className="text-2xl font-JakartaBold">Chat</Text>

        {
          !firstRide && (
            <View className="flex-1 h-fit flex justify-center items-center">
              <Image
                source={images.message}
                alt="message"
                className="w-full h-40"
                resizeMode="contain"
              />
              <Text className="text-3xl font-JakartaBold mt-3">
                No Messages Yet
              </Text>
              <Text className="text-base mt-2 text-center px-7">
                Start a conversation with your friends and family
              </Text>
            </View>
          )
        }

        {/* Display the first ride's data */}
        {firstRide ? (
          <View className="mt-2">
            <Text className="mt-2">Destination: {firstRide.destination_address}</Text>
            <Text className="mt-1">Driver: {firstRide.driver.first_name} {firstRide.driver.last_name}</Text>
            <Image
              source={{ uri: firstRide.driver.profile_image_url }}
              alt="Driver Image"
              className="w-16 h-16 rounded-full mt-2"
            />
            <Text className="mt-1">Car Seats: {firstRide.driver.car_seats}</Text>
            <Text className="mt-1">Fare Price: ₹{firstRide.fare_price}</Text>
          </View>
        ) : (
          <Text className="mt-5">No recent rides available.</Text>
        )}

        {/* Scrollable Chat Messages */}
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ marginTop: 20 , marginBottom : 40 }}>
          {chatMessages.map((message, index) => (
            <View
              key={index}
              className={`mt-3 ${message.sender === 'Rider' ? 'items-end' : 'items-start'}`}
            >
              {/* Display sender's icon at the top of the message */}
              <View className="w-8 h-8 bg-blue-500 rounded-full justify-center items-center mb-2">
                <Text className="text-white text-xl font-bold">
                  {message.sender === 'Rider' ? 'R' : 'K'}
                </Text>
              </View>

              {/* Message bubble */}
              <Text
                className={`text-base ${message.sender === 'Rider' ? 'bg-blue-500 text-white p-3 rounded-lg' : 'bg-gray-300 p-3 rounded-lg'}`}
              >
                {message.message}
              </Text>
            </View>
          ))}
        </ScrollView>

      </ScrollView>

      {/* Message Input Section */}
      <View className="absolute  bottom-20 left-0 right-0 p-5 flex-row items-center z-50">
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          className="flex-1 p-3 border border-gray-300 rounded-lg"
        />
        <TouchableOpacity onPress={handleSendMessage} className="ml-3 p-3 bg-blue-500 rounded-lg">
          <Text className="text-white">Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Chat;
