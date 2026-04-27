import { auth, db } from "@/config/firebase";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
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
  priority: "High" | "Medium" | "Low";
  bought: boolean;
  boughtBy: string | null;
};

type GiftList = {
  title: string;
  ownerId: string;
  inviteCode: string;
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

  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [editPriority, setEditPriority] = useState<"High" | "Medium" | "Low">(
    "Medium",
  );

  const isOwner = list?.ownerId === user?.uid;

  //-----------------------------------
  // Load list
  //-----------------------------------
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

  //-----------------------------------
  // Realtime items listener
  //-----------------------------------
  useEffect(() => {
    const ref = collection(db, "lists", listId, "items");

    const unsub = onSnapshot(ref, (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));

      // 🔥 OWNER VIEW: strip ALL reservation data
      const filteredItems = items.map((item) => {
        if (isOwner) {
          return {
            ...item, // keep priority + everything else
            bought: false,
            boughtBy: null,
          };
        }

        return item;
      });

      setItems(filteredItems);
    });

    return unsub;
  }, [listId, isOwner]);

  //-----------------------------------
  // Share list
  //-----------------------------------
  const handleShareList = async () => {
    if (!list?.inviteCode) return;

    const inviteLink = Linking.createURL(`/invite/${list.inviteCode}`);

    await Clipboard.setStringAsync(inviteLink);

    Alert.alert("Invite Link Copied", `Share this link:\n\n${inviteLink}`);
  };

  //-----------------------------------
  // Add item
  //-----------------------------------
  const handleAddItem = async () => {
    if (!newItem.trim()) return;

    try {
      await addDoc(collection(db, "lists", listId, "items"), {
        name: newItem,
        link: productLink,
        priority,
        bought: false,
        boughtBy: null,
      });

      setNewItem("");
      setProductLink("");
      setPriority("Medium");
    } catch (error) {
      console.log(error);
    }
  };

  //-----------------------------------
  // Delete item
  //-----------------------------------
  const handleDelete = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, "lists", listId, "items", itemId));
    } catch (error) {
      console.log(error);
    }
  };

  //-----------------------------------
  // Toggle bought
  //-----------------------------------
  const toggleBought = async (item: GiftItem) => {
    if (isOwner) return;

    try {
      await updateDoc(doc(db, "lists", listId, "items", item.id), {
        bought: !item.bought,
        boughtBy: item.bought ? null : user?.email,
      });
    } catch (error) {
      console.log(error);
    }
  };

  //-----------------------------------
  // Save edit
  //-----------------------------------
  const saveEdit = async () => {
    if (!editingItem) return;

    try {
      await updateDoc(doc(db, "lists", listId, "items", editingItem.id), {
        name: editName,
        link: editLink,
        priority: editPriority,
      });

      setEditingItem(null);
    } catch (error) {
      console.log(error);
    }
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
      {/* HEADER */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable
          onPress={() => {
            if (router.canGoBack?.()) {
              router.back();
            } else {
              router.push("/(tabs)/lists");
            }
          }}
        >
          <Text className="text-[#D90701] text-lg">← Lists</Text>
        </Pressable>

        {isOwner && (
          <Pressable
            onPress={handleShareList}
            className="bg-[#D90701] px-4 py-2 rounded-xl"
          >
            <Text className="text-white font-semibold">Share</Text>
          </Pressable>
        )}
      </View>

      {/* TITLE */}
      <Text className="text-white text-3xl font-bold">{list.title}</Text>

      <Text className="text-gray-500 mt-2 mb-6">
        {isOwner
          ? "Manage your gift list"
          : "Reserve items before someone else does"}
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

          <Text className="text-white font-semibold mb-2">Priority</Text>

          <View className="flex-row gap-2 mb-4">
            {["High", "Medium", "Low"].map((level) => (
              <Pressable
                key={level}
                onPress={() => setPriority(level as "High" | "Medium" | "Low")}
                className={`px-4 py-2 rounded-xl ${
                  priority === level ? "bg-[#D90701]" : "bg-zinc-800"
                }`}
              >
                <Text className="text-white">{level}</Text>
              </Pressable>
            ))}
          </View>

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
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <Text className="text-gray-600 text-center mt-10">No items yet</Text>
        }
        renderItem={({ item }) => (
          <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
            <Text className="text-white text-lg font-semibold">
              {item.name}
            </Text>

            <View className="mt-2">
              <Text
                className={`text-sm font-medium ${
                  item.priority === "High"
                    ? "text-red-500"
                    : item.priority === "Medium"
                      ? "text-yellow-400"
                      : "text-green-400"
                }`}
              >
                {item.priority} Priority
              </Text>
            </View>

            {!!item.link && (
              <Text className="text-[#D90701] mt-1 text-sm">{item.link}</Text>
            )}

            {!isOwner && (
              <Text className="text-gray-500 mt-2 text-sm">
                {item.bought ? `Reserved by ${item.boughtBy}` : "Available"}
              </Text>
            )}

            <View className="mt-4 flex-row gap-3">
              {isOwner ? (
                <>
                  <Pressable
                    onPress={() => {
                      setEditingItem(item);
                      setEditName(item.name);
                      setEditLink(item.link || "");
                      setEditPriority(item.priority);
                    }}
                    className="flex-1 bg-zinc-800 py-2 rounded-xl"
                  >
                    <Text className="text-white text-center">Edit</Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      Alert.alert("Delete", "Remove this item?", [
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
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

            <Text className="text-white font-semibold mb-2">Priority</Text>

            <View className="flex-row gap-2 mb-4">
              {["High", "Medium", "Low"].map((level) => (
                <Pressable
                  key={level}
                  onPress={() =>
                    setEditPriority(level as "High" | "Medium" | "Low")
                  }
                  className={`px-4 py-2 rounded-xl ${
                    editPriority === level ? "bg-[#D90701]" : "bg-zinc-800"
                  }`}
                >
                  <Text className="text-white">{level}</Text>
                </Pressable>
              ))}
            </View>

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
