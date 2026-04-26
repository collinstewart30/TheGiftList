import { auth, db } from "@/config/firebase";
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export default function CreateListScreen() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  //----------------------------------
  // Generate unique invite code
  //----------------------------------
  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  //----------------------------------
  // Create list
  //----------------------------------
  async function createList() {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a list name.");
      return;
    }

    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    try {
      setLoading(true);

      const inviteCode = generateInviteCode();

      const docRef = await addDoc(collection(db, "lists"), {
        title: title.trim(),
        ownerId: auth.currentUser.uid,
        members: [],
        inviteCode,
        createdAt: Date.now(),
      });

      setTitle("");

      Alert.alert(
        "List Created",
        "Your list is ready. You can now add gift items and share it with others.",
      );

      // Send user directly to newly created list
      router.replace(`/list/${docRef.id}`);
    } catch (e) {
      console.log("CREATE LIST ERROR:", e);

      Alert.alert("Error", "Could not create list. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-black px-6 justify-center">
      {/* Header */}
      <Text className="text-white text-3xl font-bold mb-2">Create a List</Text>

      <Text className="text-gray-400 mb-8">
        Start a new gift list and share it with friends & family
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
        className={`py-4 rounded-xl ${
          loading ? "bg-zinc-700" : "bg-[#D90701]"
        }`}
      >
        <Text className="text-white text-center font-semibold text-base">
          {loading ? "Creating..." : "Create List"}
        </Text>
      </Pressable>

      {/* Footer */}
      <Text className="text-gray-600 text-center mt-8 text-sm">
        Your list stays private until you choose to share it
      </Text>
    </View>
  );
}
