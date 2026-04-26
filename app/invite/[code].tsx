import { auth, db } from "@/config/firebase";
import { router, useLocalSearchParams } from "expo-router";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

type GiftList = {
  id: string;
  title: string;
  ownerId: string;
  members: string[];
  inviteCode?: string;
};

export default function InviteScreen() {
  const { code } = useLocalSearchParams();
  const user = auth.currentUser;

  const [list, setList] = useState<GiftList | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // -----------------------------
  // FIND LIST FROM INVITE CODE
  // -----------------------------
  useEffect(() => {
    async function loadInvite() {
      try {
        const q = query(
          collection(db, "lists"),
          where("inviteCode", "==", code),
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];

          setList({
            id: docSnap.id,
            ...(docSnap.data() as Omit<GiftList, "id">),
          });
        } else {
          setList(null);
        }
      } catch (err) {
        console.log("INVITE ERROR:", err);
        setList(null);
      } finally {
        setLoading(false);
      }
    }

    if (code) loadInvite();
  }, [code]);

  // -----------------------------
  // JOIN LIST
  // -----------------------------
  const handleJoin = async () => {
    if (!list || !user) {
      Alert.alert("Error", "You must be logged in to join.");
      return;
    }

    try {
      setJoining(true);

      await updateDoc(doc(db, "lists", list.id), {
        members: arrayUnion(user.uid),
      });

      Alert.alert("Success", "You joined the list!");

      router.replace("/(tabs)/lists");
    } catch (err) {
      console.log("JOIN ERROR:", err);
      Alert.alert("Error", "Could not join list.");
    } finally {
      setJoining(false);
    }
  };

  // -----------------------------
  // LOADING STATE
  // -----------------------------
  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="#D90701" />
        <Text className="text-gray-400 mt-4">Loading invite...</Text>
      </View>
    );
  }

  // -----------------------------
  // INVALID INVITE
  // -----------------------------
  if (!list) {
    return (
      <View className="flex-1 bg-black justify-center items-center px-6">
        <Text className="text-white text-2xl font-bold mb-2">
          Invalid Invite
        </Text>
        <Text className="text-gray-400 text-center">
          This invite link is invalid or expired.
        </Text>
      </View>
    );
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <View className="flex-1 bg-black px-6 justify-center">
      <Text className="text-white text-3xl font-bold mb-2">
        You've been invited 🎁
      </Text>

      <Text className="text-gray-400 mb-6">
        Join this gift list to start reserving items
      </Text>

      <View className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 mb-8">
        <Text className="text-white text-xl font-semibold">{list.title}</Text>
      </View>

      <Pressable
        onPress={handleJoin}
        disabled={joining}
        className="bg-[#D90701] py-4 rounded-xl active:opacity-80"
      >
        <Text className="text-white text-center font-semibold">
          {joining ? "Joining..." : "Join List"}
        </Text>
      </Pressable>
    </View>
  );
}
