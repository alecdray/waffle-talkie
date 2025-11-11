import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { useUserData } from "@/src/hooks/use-user-data";

export default function Index() {
  const { userData, isLoading, updateUserData } = useUserData();
  const [name, setName] = useState(userData?.name || "");

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!userData?.name) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>What&apos;s your name?</Text>
        <TextInput
          style={{
            height: 40,
            width: "90%",
            margin: 12,
            borderWidth: 1,
            padding: 10,
          }}
          onChangeText={setName}
          value={name}
        />
        <Button title="Submit" onPress={() => updateUserData({ name })} />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Hi {userData.name}!</Text>
    </View>
  );
}
