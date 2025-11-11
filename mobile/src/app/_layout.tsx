import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { UserDataProvider } from "../hooks/use-user-data";

export default function RootLayout() {
  return (
    <UserDataProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </UserDataProvider>
  );
}
