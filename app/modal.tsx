import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function ModalScreen() {
  return (
    <View className="flex-1 bg-black justify-center items-center px-6">
      <Text className="text-white text-3xl font-bold mb-4">Modal Screen</Text>

      <Text className="text-gray-400 text-center mb-8">
        You can use this for future features like invite links, settings popups,
        confirmations, etc.
      </Text>

      <Pressable
        onPress={() => router.back()}
        className="bg-[#D90701] px-6 py-4 rounded-xl"
      >
        <Text className="text-white font-semibold">Close</Text>
      </Pressable>
    </View>
  );
}
