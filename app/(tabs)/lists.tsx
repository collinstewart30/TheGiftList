import { auth, db } from "@/config/firebase";
import { router } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  or,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";

type GiftList = {
  id: string;
  title: string;
  ownerId: string;
};

export default function Lists() {
  const [lists, setLists] = useState<GiftList[]>([]);
  const user = auth.currentUser;

  // -------------------------
  // Load lists
  // -------------------------
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "lists"),
      or(
        where("ownerId", "==", user.uid),
        where("members", "array-contains", user.uid),
      ),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setLists(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<GiftList, "id">),
        })),
      );
    });

    return unsub;
  }, [user]);

  // -------------------------
  // Delete list
  // -------------------------
  const handleDelete = async (listId: string) => {
    try {
      await deleteDoc(doc(db, "lists", listId));
    } catch (e) {
      console.log("Delete error:", e);
    }
  };

  return (
    <View className="flex-1 bg-black px-5 pt-16">
      {/* Header */}
      <Text className="text-white text-3xl font-bold">Your Lists</Text>

      <Text className="text-gray-500 mt-1 mb-6">
        Shared and private gift lists
      </Text>

      {/* Lists */}
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text className="text-gray-600 text-center mt-10">
            No lists yet — create your first one
          </Text>
        }
        renderItem={({ item }) => {
          const isOwner = item.ownerId === user?.uid;

          return (
            <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl mb-4">
              {/* Title */}
              <Pressable onPress={() => router.push(`/list/${item.id}`)}>
                <Text className="text-white text-lg font-semibold">
                  {item.title}
                </Text>

                <Text className="text-gray-500 text-sm mt-1">
                  Tap to view list
                </Text>
              </Pressable>

              {/* Actions */}
              {isOwner && (
                <View className="mt-4 flex-row justify-end">
                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        "Delete List",
                        "This will permanently delete this list and all items.",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: () => handleDelete(item.id),
                          },
                        ],
                      )
                    }
                    className="bg-zinc-800 px-4 py-2 rounded-xl"
                  >
                    <Text className="text-white">Delete</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}
