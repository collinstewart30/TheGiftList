import { auth, db } from "@/config/firebase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

type GiftItem = {
  id: string;
  name: string;
  link?: string;
  bought: boolean;
  boughtBy: string | null;
};

type GiftList = {
  title: string;
  ownerId: string;
};

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams();
  const listId = id as string;

  const user = auth.currentUser;

  const [list, setList] = useState<GiftList | null>(null);
  const [items, setItems] = useState<GiftItem[]>([]);

  const [newItem, setNewItem] = useState("");
  const [productLink, setProductLink] = useState("");

  const [editingItem, setEditingItem] = useState<GiftItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editLink, setEditLink] = useState("");

  const isOwner = list?.ownerId === user?.uid;

  // -----------------------
  // Load list
  // -----------------------
  useEffect(() => {
    async function fetchList() {
      const ref = doc(db, "lists", listId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setList(snap.data() as GiftList);
      }
    }

    fetchList();
  }, [listId]);

  // -----------------------
  // Items realtime
  // -----------------------
  useEffect(() => {
    const ref = collection(db, "lists", listId, "items");

    const unsub = onSnapshot(ref, (snapshot) => {
      setItems(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<GiftItem, "id">),
        })),
      );
    });

    return unsub;
  }, [listId]);

  // -----------------------
  // Add item
  // -----------------------
  const handleAddItem = async () => {
    if (!newItem.trim()) return;

    await addDoc(collection(db, "lists", listId, "items"), {
      name: newItem,
      link: productLink,
      bought: false,
      boughtBy: null,
    });

    setNewItem("");
    setProductLink("");
  };

  // -----------------------
  // Delete
  // -----------------------
  const handleDelete = async (itemId: string) => {
    await deleteDoc(doc(db, "lists", listId, "items", itemId));
  };

  // -----------------------
  // Toggle bought
  // -----------------------
  const toggleBought = async (item: GiftItem) => {
    if (isOwner) return;

    await updateDoc(doc(db, "lists", listId, "items", item.id), {
      bought: !item.bought,
      boughtBy: item.bought ? null : user?.email,
    });
  };

  // -----------------------
  // Save edit
  // -----------------------
  const saveEdit = async () => {
    if (!editingItem) return;

    await updateDoc(doc(db, "lists", listId, "items", editingItem.id), {
      name: editName,
      link: editLink,
    });

    setEditingItem(null);
  };

  if (!list) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Loading list...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black pt-14 px-5">
      {/* NAV HEADER */}
      <View className="flex-row items-center mb-6">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Text className="text-[#D90701] text-lg">← Back</Text>
        </Pressable>

        <Text className="text-white text-xl font-bold">{list.title}</Text>
      </View>

      {/* SUBTITLE */}
      <Text className="text-gray-500 mb-6">
        {isOwner ? "Manage your gift list" : "Reserve items for the recipient"}
      </Text>

      {/* ADD ITEM */}
      {isOwner && (
        <View className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-6">
          <Text className="text-white font-semibold mb-3">Add Gift Idea</Text>

          <TextInput
            placeholder="Item name"
            placeholderTextColor="#666"
            value={newItem}
            onChangeText={setNewItem}
            className="bg-black text-white p-3 rounded-xl border border-zinc-800 mb-3"
          />

          <TextInput
            placeholder="Product link (optional)"
            placeholderTextColor="#666"
            value={productLink}
            onChangeText={setProductLink}
            className="bg-black text-white p-3 rounded-xl border border-zinc-800 mb-3"
          />

          <Pressable
            onPress={handleAddItem}
            className="bg-[#D90701] py-3 rounded-xl"
          >
            <Text className="text-white text-center font-semibold">
              Add Item
            </Text>
          </Pressable>
        </View>
      )}

      {/* ITEMS */}
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <Text className="text-gray-600 text-center mt-10">No items yet</Text>
        }
        renderItem={({ item }) => (
          <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
            <Text className="text-white text-lg font-semibold">
              {item.name}
            </Text>

            {!!item.link && (
              <Text className="text-[#D90701] mt-1 text-sm">{item.link}</Text>
            )}

            <Text className="text-gray-500 mt-2 text-sm">
              {item.bought ? `Reserved by ${item.boughtBy}` : "Available"}
            </Text>

            {/* ACTIONS */}
            <View className="mt-4 flex-row gap-3">
              {isOwner ? (
                <>
                  <Pressable
                    onPress={() => {
                      setEditingItem(item);
                      setEditName(item.name);
                      setEditLink(item.link || "");
                    }}
                    className="flex-1 bg-zinc-800 py-2 rounded-xl"
                  >
                    <Text className="text-white text-center">Edit</Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      Alert.alert("Delete", "Remove this item?", [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => handleDelete(item.id),
                        },
                      ])
                    }
                    className="flex-1 bg-zinc-800 py-2 rounded-xl"
                  >
                    <Text className="text-white text-center">Delete</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  onPress={() => toggleBought(item)}
                  className={`flex-1 py-3 rounded-xl ${
                    item.bought ? "bg-zinc-700" : "bg-[#D90701]"
                  }`}
                >
                  <Text className="text-white text-center font-semibold">
                    {item.bought ? "Unreserve" : "Reserve"}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      />

      {/* EDIT MODAL */}
      <Modal visible={!!editingItem} transparent animationType="fade">
        <View className="flex-1 bg-black/70 justify-center px-6">
          <View className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
            <Text className="text-white text-lg font-semibold mb-4">
              Edit Item
            </Text>

            <TextInput
              value={editName}
              onChangeText={setEditName}
              className="bg-black text-white p-3 rounded-xl mb-3 border border-zinc-800"
            />

            <TextInput
              value={editLink}
              onChangeText={setEditLink}
              className="bg-black text-white p-3 rounded-xl mb-4 border border-zinc-800"
            />

            <Pressable
              onPress={saveEdit}
              className="bg-[#D90701] py-3 rounded-xl mb-3"
            >
              <Text className="text-white text-center font-semibold">Save</Text>
            </Pressable>

            <Pressable onPress={() => setEditingItem(null)}>
              <Text className="text-gray-400 text-center">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
