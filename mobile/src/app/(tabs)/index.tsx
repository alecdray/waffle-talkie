import {
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { downloadAudio, getMessages, markMessageReceived } from "@/src/api/audio";
import { useAuth } from "@/src/hooks/use-auth";
import { AudioMessage } from "@/src/types/audio";

export default function Index() {
  const { auth } = useAuth();
  const [messages, setMessages] = useState<AudioMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const player = useAudioPlayer();
  const playerStatus = useAudioPlayerStatus(player);

  const fetchMessages = async (isRefresh = false) => {
    if (!auth?.token) return;

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const fetchedMessages = await getMessages(auth.token);
      setMessages(fetchedMessages);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch messages");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (!playerStatus.playing && playingMessageId) {
      const timeoutId = setTimeout(() => {
        setPlayingMessageId(null);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [playerStatus.playing, playingMessageId]);

  const handlePlayMessage = async (message: AudioMessage) => {
    if (!auth?.token) return;

    try {
      if (playingMessageId === message.id && playerStatus.playing) {
        player.pause();
        return;
      }

      const audioUrl = downloadAudio(message.id, auth.token);
      player.replace(audioUrl);
      player.play();
      setPlayingMessageId(message.id);

      await markMessageReceived(message.id, auth.token);

      setMessages((prev) => prev.filter((m) => m.id !== message.id));
    } catch (error) {
      Alert.alert("Error", "Failed to play message");
    }
  };

  const onRefresh = useCallback(() => {
    fetchMessages(true);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const renderMessage = ({ item }: { item: AudioMessage }) => {
    const isPlaying = playingMessageId === item.id && playerStatus.playing;

    return (
      <TouchableOpacity
        style={[styles.messageCard, isPlaying && styles.messageCardPlaying]}
        onPress={() => handlePlayMessage(item)}
      >
        <View style={styles.messageHeader}>
          <View style={styles.playIconContainer}>
            <Text style={styles.playIcon}>{isPlaying ? "⏸" : "▶️"}</Text>
          </View>
          <View style={styles.messageInfo}>
            <Text style={styles.messageDuration}>
              {formatDuration(item.duration)}
            </Text>
            <Text style={styles.messageDate}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
        {isPlaying && (
          <View style={styles.playingIndicator}>
            <Text style={styles.playingText}>Playing...</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
        <Text style={styles.subtitle}>
          {messages.length === 0
            ? "No new messages"
            : `${messages.length} new ${messages.length === 1 ? "message" : "messages"}`}
        </Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          messages.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>📭</Text>
            <Text style={styles.emptyStateTitle}>No messages yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              When someone sends you an audio message, it will appear here
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  messageCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  messageCardPlaying: {
    borderColor: "#007AFF",
    backgroundColor: "#E8F4FD",
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  playIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  playIcon: {
    fontSize: 20,
  },
  messageInfo: {
    flex: 1,
  },
  messageDuration: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  messageDate: {
    fontSize: 14,
    color: "#666",
  },
  playingIndicator: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  playingText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
});
