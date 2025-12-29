import { View, Text, StyleProp } from "react-native";
import { TextStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";

export function BasicProgressBar({
  progress,
  height = 10,
  color = "#007AFF",
  leftBottomText,
  rightBottomText,
  textStyle = { color: "#000", fontSize: 12 },
}: {
  progress: number;
  height?: number;
  color?: string;
  leftBottomText?: string;
  rightBottomText?: string;
  textStyle?: StyleProp<TextStyle>;
}) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View>
      <View
        style={[
          {
            width: "100%",
            backgroundColor: "#E5E5E5",
            borderRadius: 10,
            overflow: "hidden",
          },
          { height },
        ]}
      >
        <View
          style={[
            {
              height: "100%",
              borderRadius: 10,
            },
            {
              width: `${clampedProgress}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      {(leftBottomText || rightBottomText) && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 5,
            paddingVertical: 5,
          }}
        >
          <Text style={textStyle}>{leftBottomText}</Text>
          <Text style={textStyle}>{rightBottomText}</Text>
        </View>
      )}
    </View>
  );
}
