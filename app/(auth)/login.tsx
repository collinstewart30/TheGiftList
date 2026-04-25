import { Link, router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { auth } from "../../config/firebase"; // adjust path if needed

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      // 👇 THIS is what sends user to "home"
      router.replace("/(tabs)");
    } catch (error: any) {
      console.log(error);
      Alert.alert("Login failed", error.message);
    }
  };

  return (
    <View className="flex-1 bg-black px-6 justify-center">
      <Text className="text-white text-4xl font-bold mb-2">Welcome back</Text>

      <Text className="text-gray-400 mb-10">Sign in to continue</Text>

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
        onPress={handleLogin}
        className="bg-primary py-4 rounded-xl active:opacity-80"
      >
        <Text className="text-white text-center font-semibold text-base">
          Log in
        </Text>
      </Pressable>

      <View className="flex-row justify-center mt-6">
        <Text className="text-gray-500">No account? </Text>
        <Link href="/(auth)/signup" className="text-primary font-semibold">
          Sign up
        </Link>
      </View>
    </View>
  );
}
