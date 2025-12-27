import { Directory, File, Paths } from "expo-file-system";
import { useClient } from "./use-client";

const audioDir = new Directory(Paths.document, "audio");

/**
 * Ensures the audio directory exists
 */
const ensureAudioDirectoryExists = (): void => {
  if (!audioDir.exists) {
    audioDir.create();
  }
};

/**
 * Gets the File object for a message ID
 */
const getAudioFile = (messageId: string): File => {
  return new File(audioDir, `${messageId}.m4a`);
};

/**
 * Checks if an audio file exists locally
 */
const audioFileExists = (messageId: string): boolean => {
  const file = getAudioFile(messageId);
  return file.exists;
};

/**
 * Gets local audio URI if exists
 */
export const getAudioUri = (messageId: string): string | null => {
  const file = getAudioFile(messageId);

  if (file.exists) {
    return file.uri;
  }

  return null;
};

export const useAudio = () => {
  const { getClient } = useClient();

  /**
   * Gets all stored message IDs from local audio files
   */
  const getStoredMessages = (): File[] => {
    if (!audioDir.exists) {
      return [];
    }

    const contents = audioDir.list();
    const messages: File[] = [];

    for (const item of contents) {
      if (!(item instanceof Directory) && item.name.endsWith(".m4a")) {
        messages.push(item);
      }
    }

    return messages;
  };

  /**
   * Downloads audio file
   */
  const prefetchAudioMessage = async (messageId: string): Promise<void> => {
    if (audioFileExists(messageId)) {
      return;
    }

    ensureAudioDirectoryExists();
    const file = getAudioFile(messageId);

    const api = await getClient();
    await api.audio.downloadAndSaveAudio(messageId, file);
    await api.audio.markMessageReceived(messageId);
  };

  /**
   * Prefetches multiple audio files in parallel and returns IDs of successfully downloaded files
   */
  const prefetchUserAudioMessages = async (): Promise<string[]> => {
    const api = await getClient();
    const messageIds = (await api.audio.getMessages()).map(
      (message) => message.id,
    );

    const results = await Promise.allSettled(
      messageIds.map(async (id) => {
        await prefetchAudioMessage(id);
        return id;
      }),
    );

    return results
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<string>).value);
  };

  /**
   * Deletes a local audio file
   */
  const deleteAudioFile = async (messageId: string): Promise<void> => {
    const file = getAudioFile(messageId);

    if (file.exists) {
      file.delete();
    }
  };

  /**
   * Deletes all locally stored audio files
   */
  const clearAllAudioFiles = async (): Promise<void> => {
    if (audioDir.exists) {
      audioDir.delete();
    }
  };

  return {
    prefetchAudioMessage,
    prefetchUserAudioMessages,
    deleteAudioFile,
    clearAllAudioFiles,
    getStoredMessages,
  };
};
