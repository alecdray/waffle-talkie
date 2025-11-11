import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useEffect } from "react";
import { View, Text, Button, Alert } from "react-native";

export default function Send() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const player = useAudioPlayer();
  const playerStatus = useAudioPlayerStatus(player);
  const playbackPercentage = playerStatus.currentTime / playerStatus.duration;

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async () => {
    // The recording will be available on `audioRecorder.uri`.
    await audioRecorder.stop();
    player.replace(audioRecorder.uri);
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied");
      }

      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button
        title={recorderState.isRecording ? "Stop Recording" : "Start Recording"}
        onPress={recorderState.isRecording ? stopRecording : record}
      />
      <Button
        title={playerStatus.playing ? "Stop" : "Play"}
        onPress={() => {
          player.seekTo(0);
          player.play();
        }}
      />
      <BasicProgressBar progress={playbackPercentage * 100}></BasicProgressBar>
    </View>
  );
}

function BasicProgressBar({
  progress,
  height = 10,
  color = "#007AFF",
}: {
  progress: number;
  height?: number;
  color?: string;
}) {
  // progress should be between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
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
  );
}
