import { useUserData } from "@/src/hooks/use-user-data";
import { View, Text, Button } from "react-native";

export default function Settings() {
  const { removeUserData } = useUserData();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Settings</Text>
      <Button title="Reset User Data" onPress={() => removeUserData()}></Button>
    </View>
  );
}
