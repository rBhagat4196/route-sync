import { useUser } from "@clerk/clerk-expo";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import InputField from "@/components/InputField";

const Profile = () => {
  const { user } = useUser();

  // Sample Data for additional fields (User Rating, Distance Travelled, Time Saved, and Cost Saved)
  const userRating = 4.5;
  const distanceTravelled = 120; // in kilometers
  const timeSaved = 35; // in minutes
  const costSaved = 150; // in currency (e.g., INR, USD)

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text className="text-2xl font-JakartaBold my-5">My profile</Text>

        {/* Profile Image Section */}
        <View className="flex items-center justify-center my-5">
          <Image
            source={{
              uri: user?.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
            }}
            style={{ width: 110, height: 110, borderRadius: 110 / 2 }}
            className="rounded-full h-[110px] w-[110px] border-[3px] border-white shadow-sm shadow-neutral-300"
          />
        </View>
        {/* User Statistics Section */}
        <View className="mt-6 bg-gray-100 rounded-lg p-5 shadow-lg">
          <Text className="text-xl font-JakartaBold mb-4">User Statistics</Text>

          <View className="space-y-4">
            {/* User Rating */}
            <View className="flex-row items-center space-x-3">
              <Text className="text-lg font-semibold text-gray-700">
                User Rating:
              </Text>
              <Text className="text-xl text-yellow-500 font-semibold">
                {userRating} / 5
              </Text>
            </View>

            {/* Distance Travelled */}
            <View className="flex-row items-center space-x-3">
              <Text className="text-lg font-semibold text-gray-700">
                Total Distance Travelled:
              </Text>
              <Text className="text-xl text-blue-500 font-semibold">
                {distanceTravelled} km
              </Text>
            </View>

            {/* Time Saved */}
            <View className="flex-row items-center space-x-3">
              <Text className="text-lg font-semibold text-gray-700">
                Time Saved:
              </Text>
              <Text className="text-xl text-green-500 font-semibold">
                {timeSaved} minutes
              </Text>
            </View>

            {/* Cost Saved */}
            <View className="flex-row items-center space-x-3">
              <Text className="text-lg font-semibold text-gray-700">
                Cost Saved:
              </Text>
              <Text className="text-xl text-purple-500 font-semibold">
                ₹{costSaved}
              </Text>
            </View>
          </View>
        </View>
        {/* User Info Section */}
        <View className="flex flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 px-5 py-3">
          <View className="flex flex-col items-start justify-start w-full">
            <InputField
              label="Name"
              placeholder={`${user?.firstName || ""} ${user?.lastName || "Not Found"}`}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={true}
            />

            <InputField
              label="Email"
              placeholder={
                user?.primaryEmailAddress?.emailAddress || "Not Found"
              }
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={false}
            />

            <InputField
              label="Phone"
              placeholder={
                user?.primaryPhoneNumber?.phoneNumber || "+91876732XXXX"
              }
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={true}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
