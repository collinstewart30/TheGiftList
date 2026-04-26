import { auth } from "@/config/firebase";
import { signOut } from "firebase/auth";
import { Pressable, Text, View } from "react-native";

export default function ProfileScreen() {
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <View className="flex-1 bg-black px-6 pt-16">
      <Text className="text-white text-3xl font-bold mb-2">Profile</Text>

      <Text className="text-gray-400 mb-8">Manage your account settings</Text>

      <Pressable
        onPress={handleLogout}
        className="bg-[#D90701] py-4 rounded-xl"
      >
        <Text className="text-white text-center font-semibold">Logout</Text>
      </Pressable>
    </View>
  );
}
