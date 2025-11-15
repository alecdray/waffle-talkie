import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/use-auth";

export default function WaitingScreen() {
  const [isChecking, setIsChecking] = useState(false);
  const { auth, login, logout } = useAuth();
  const router = useRouter();

  const handleCheckStatus = async () => {
    try {
      setIsChecking(true);
      await login();
      router.replace("/app");
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes("not approved")) {
        Alert.alert(
          "Not Approved Yet",
          "Your account is still pending approval. Please try again later.",
        );
      } else {
        Alert.alert("Error", errorMessage || "Failed to check status");
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth/register");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⏳</Text>
        </View>

        <Text style={styles.title}>Waiting for Approval</Text>
        <Text style={styles.subtitle}>
          Hello, {auth?.name || "there"}! Your account is pending approval from
          an administrator.
        </Text>

        <TouchableOpacity
          style={[styles.button, isChecking && styles.buttonDisabled]}
          onPress={handleCheckStatus}
          disabled={isChecking}
        >
          {isChecking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Check Status</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isChecking}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.info}>
          {
            "You'll be able to use the app once an admin approves your account. Check back later or contact your administrator."
          }
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
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
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
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    padding: 16,
    alignItems: "center",
  },
  logoutText: {
    color: "#FF3B30",
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
