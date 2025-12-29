import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/src/hooks/use-auth";
import { useAudio } from "@/src/hooks/use-audio";

export default function Settings() {
  const { auth, logout } = useAuth();
  const { clearAllAudioFiles } = useAudio();
  const router = useRouter();

  const handleClearAudioCache = () => {
    Alert.alert(
      "Clear Audio Cache",
      "Are you sure you want to delete all downloaded audio messages? They will need to be re-downloaded when you refresh.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllAudioFiles();
              Alert.alert("Success", "All audio messages have been deleted");
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Failed to delete audio messages");
            }
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
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

        <TouchableOpacity
          style={styles.clearCacheButton}
          onPress={handleClearAudioCache}
        >
          <Text style={styles.clearCacheText}>Clear Audio Cache</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  clearCacheButton: {
    marginTop: 32,
    backgroundColor: "#FF9500",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  clearCacheText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 16,
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
