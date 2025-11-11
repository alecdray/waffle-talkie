import { useRouter } from "expo-router";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@/src/hooks/use-auth";

export default function Settings() {
  const { auth, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
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
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{auth?.name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>User ID</Text>
          <Text style={styles.value}>{auth?.userId}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>
            {auth?.approved ? "Approved" : "Pending"}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    color: "#000",
  },
  logoutButton: {
    marginTop: 32,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
