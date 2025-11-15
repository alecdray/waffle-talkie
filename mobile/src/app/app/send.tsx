import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { uploadAudio } from "@/src/api/audio";
import { useAuth } from "@/src/hooks/use-auth";

export default function Send() {
  const { auth } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const player = useAudioPlayer();
  const playerStatus = useAudioPlayerStatus(player);
  const playbackPercentage = playerStatus.currentTime / playerStatus.duration;

  const record = async () => {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setHasRecording(false);
    } catch (error) {
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      player.replace(audioRecorder.uri);
      setHasRecording(true);
    } catch (error) {
      Alert.alert("Error", "Failed to stop recording");
    }
  };

  const handleSend = async () => {
    if (!audioRecorder.uri || !auth?.token) {
      Alert.alert("Error", "No recording to send");
      return;
    }

    try {
      setIsUploading(true);
      const duration = Math.floor(recorderState.durationMillis / 1000);
      await uploadAudio(audioRecorder.uri, duration, auth.token);

      Alert.alert("Success", "Audio message sent!");
      setHasRecording(false);
      player.pause();
    } catch (error) {
      Alert.alert("Error", (error as Error).message || "Failed to send audio");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert("Discard Recording", "Are you sure you want to discard?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          player.pause();
          setHasRecording(false);
        },
      },
    ]);
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission Denied", "Microphone access is required");
      }

      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  const formatTime = (millis: number) => {
    const seconds = Math.floor(millis / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Send Audio Message</Text>

        <View style={styles.recordingContainer}>
          {recorderState.isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.redDot} />
              <Text style={styles.recordingText}>Recording...</Text>
            </View>
          )}

          <Text style={styles.timer}>
            {formatTime(recorderState.durationMillis)}
          </Text>

          <TouchableOpacity
            style={[
              styles.recordButton,
              recorderState.isRecording && styles.recordButtonActive,
            ]}
            onPress={recorderState.isRecording ? stopRecording : record}
            disabled={isUploading}
          >
            <View style={styles.recordButtonInner} />
          </TouchableOpacity>
        </View>

        {hasRecording && (
          <View style={styles.playbackContainer}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => {
                if (playerStatus.playing) {
                  player.pause();
                } else {
                  player.play();
                }
              }}
            >
              <Text style={styles.playButtonText}>
                {playerStatus.playing ? "⏸" : "▶️"}
              </Text>
            </TouchableOpacity>

            <View style={styles.progressContainer}>
              <BasicProgressBar progress={playbackPercentage * 100} />
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.discardButton}
                onPress={handleDiscard}
                disabled={isUploading}
              >
                <Text style={styles.discardButtonText}>Discard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sendButton, isUploading && styles.buttonDisabled]}
                onPress={handleSend}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.sendButtonText}>Send</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
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
    marginBottom: 48,
    textAlign: "center",
  },
  recordingContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  redDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF3B30",
    marginRight: 8,
  },
  recordingText: {
    fontSize: 18,
    color: "#FF3B30",
    fontWeight: "600",
  },
  timer: {
    fontSize: 48,
    fontWeight: "300",
    marginBottom: 48,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  recordButtonActive: {
    backgroundColor: "#FF6B6B",
  },
  recordButtonInner: {
    width: 30,
    height: 30,
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  playbackContainer: {
    marginTop: 32,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  playButtonText: {
    fontSize: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
  },
  discardButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF3B30",
    alignItems: "center",
  },
  discardButtonText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
  },
  sendButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
});
