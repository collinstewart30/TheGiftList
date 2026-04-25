import { signOut } from "firebase/auth";
import { Pressable, Text, View } from "react-native";
import { auth } from "../../config/firebase";

export default function HomeScreen() {
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.log("Logout error:", e);
    }
  };

  return (
    <View className="flex-1 bg-black px-6 pt-20">
      {/* Header */}
      <View className="mb-10">
        <Text className="text-white text-4xl font-bold">Welcome 👋</Text>

        <Text className="text-gray-400 mt-2">Here’s your dashboard</Text>
      </View>

      {/* User card */}
      <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
        <Text className="text-gray-400 text-sm mb-1">Signed in as</Text>

        <Text className="text-white text-lg font-semibold">{user?.email}</Text>
      </View>

      {/* Quick stats / placeholder cards */}
      <View className="flex-row gap-4 mb-10">
        <View className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <Text className="text-gray-400 text-sm">Status</Text>
          <Text className="text-white font-semibold mt-1">Active</Text>
        </View>

        <View className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <Text className="text-gray-400 text-sm">Plan</Text>
          <Text className="text-white font-semibold mt-1">Free</Text>
        </View>
      </View>

      {/* Action button */}
      <Pressable
        onPress={handleLogout}
        className="bg-[#D90701] py-4 rounded-xl active:opacity-80"
      >
        <Text className="text-white text-center font-semibold text-base">
          Logout
        </Text>
      </Pressable>

      {/* Footer hint */}
      <Text className="text-gray-600 text-center mt-10 text-sm">
        Built with Expo + Firebase + NativeWind
      </Text>
    </View>
  );
}
