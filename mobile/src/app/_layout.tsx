import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../hooks/use-auth";
import { UserDataProvider } from "../hooks/use-user-data";

function RootNavigator() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    ></Stack>
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
