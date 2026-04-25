import { Pressable, Text, View } from "react-native";

export default function Explore() {
  return (
    <View className="flex-1 bg-black px-6 pt-20">
      {/* Header */}
      <Text className="text-white text-4xl font-bold mb-2">Explore</Text>

      <Text className="text-gray-400 mb-10">Quick actions & features</Text>

      {/* Feature cards */}
      <View className="gap-4">
        <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <Text className="text-white font-semibold text-lg">Analytics</Text>
          <Text className="text-gray-400 mt-1">
            View your performance insights
          </Text>
        </View>

        <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <Text className="text-white font-semibold text-lg">Activity</Text>
          <Text className="text-gray-400 mt-1">Track recent actions</Text>
        </View>

        <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <Text className="text-white font-semibold text-lg">Settings</Text>
          <Text className="text-gray-400 mt-1">Manage your account</Text>
        </View>
      </View>

      {/* CTA button */}
      <Pressable className="bg-[#D90701] mt-10 py-4 rounded-xl active:opacity-80">
        <Text className="text-white text-center font-semibold">
          Create New Item
        </Text>
      </Pressable>
    </View>
  );
}
