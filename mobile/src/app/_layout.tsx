import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../hooks/use-auth";
import { UserDataProvider } from "../hooks/use-user-data";

function RootNavigator() {
  const { auth, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!auth) {
    return (
      <Stack>
        <Stack.Screen
          name="auth/register"
          options={{ title: "Register", headerShown: false }}
        />
      </Stack>
    );
  }

  if (!auth.approved || !auth.token) {
    return (
      <Stack>
        <Stack.Screen
          name="auth/waiting"
          options={{ title: "Pending Approval", headerShown: false }}
        />
      </Stack>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserDataProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </UserDataProvider>
    </AuthProvider>
  );
}
