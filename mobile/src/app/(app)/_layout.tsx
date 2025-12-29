import { useAuth } from "@/src/hooks/use-auth";
import { Redirect, Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  const { auth } = useAuth();

  if (!auth?.token) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="send"
        options={{
          title: "Send",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
        }}
      />
    </Tabs>
  );
}
