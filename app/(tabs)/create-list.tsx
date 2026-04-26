import { auth, db } from "@/config/firebase";
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export default function CreateListScreen() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function createList() {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a list name.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "lists"), {
        title: title.trim(),
        ownerId: auth.currentUser?.uid,
        members: [],
        createdAt: Date.now(),
      });

      setTitle("");

      // optional: go back to home
      router.replace("/(tabs)");
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Could not create list.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-black px-6 justify-center">
      {/* Title */}
      <Text className="text-white text-3xl font-bold mb-2">Create a List</Text>

      <Text className="text-gray-400 mb-8">
        Start a new gift list and share it with friends
      </Text>

      {/* Input */}
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Christmas 2026"
        placeholderTextColor="#666"
        className="bg-zinc-900 text-white p-4 rounded-xl border border-zinc-800 mb-6"
      />

      {/* Button */}
      <Pressable
        onPress={createList}
        disabled={loading}
        className="bg-[#D90701] py-4 rounded-xl active:opacity-80"
      >
        <Text className="text-white text-center font-semibold text-base">
          {loading ? "Creating..." : "Create List"}
        </Text>
      </Pressable>

      {/* Hint */}
      <Text className="text-gray-600 text-center mt-8 text-sm">
        Your list will be private and shareable later
      </Text>
    </View>
  );
}
