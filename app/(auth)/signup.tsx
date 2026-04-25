import { Link, router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { auth } from "../../config/firebase"; // adjust path if needed

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      // 1. create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // 2. set display name (optional but recommended)
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
      }

      // 3. go to home
      router.replace("/(tabs)");
    } catch (error: any) {
      console.log(error);
      Alert.alert("Signup failed", error.message);
    }
  };

  return (
    <View className="flex-1 bg-black px-6 justify-center">
      <Text className="text-white text-4xl font-bold mb-2">Create account</Text>

      <Text className="text-gray-400 mb-10">Join to get started</Text>

      <TextInput
        placeholder="Name"
        placeholderTextColor="#666"
        value={name}
        onChangeText={setName}
        className="bg-zinc-900 text-white p-4 rounded-xl mb-4 border border-zinc-800"
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        className="bg-zinc-900 text-white p-4 rounded-xl mb-4 border border-zinc-800"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#666"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="bg-zinc-900 text-white p-4 rounded-xl mb-6 border border-zinc-800"
      />

      <Pressable
        onPress={handleSignup}
        className="bg-primary py-4 rounded-xl active:opacity-80"
      >
        <Text className="text-white text-center font-semibold text-base">
          Sign up
        </Text>
      </Pressable>

      <View className="flex-row justify-center mt-6">
        <Text className="text-gray-500">Already have an account? </Text>
        <Link href="/(auth)/login" className="text-primary font-semibold">
          Log in
        </Link>
      </View>
    </View>
  );
}
