import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useAuth } from "../../hooks/use-auth";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, login, auth } = useAuth();
  const router = useRouter();

  if (auth) return <Redirect href="/auth/waiting" />;

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    try {
      setIsSubmitting(true);
      await register(name);
      await login().catch(() => {});
      console.log("Registration successful");
      console.log("Redirecting to home page");
      router.replace("/app");
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        (error as Error).message || "Failed to register",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Waffle Talkie</Text>
        <Text style={styles.subtitle}>Enter your name to get started</Text>

        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!isSubmitting}
        />

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? "Registering..." : "Register"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.info}>
          After registration, an admin will need to approve your account before
          you can use the app.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  info: {
    fontSize: 14,
    color: "#666",
    marginTop: 24,
    textAlign: "center",
    lineHeight: 20,
  },
});
