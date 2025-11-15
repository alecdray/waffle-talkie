import { Directory, File, Paths } from "expo-file-system";
import { API_URL } from "../api/config";
import { getMessages, markMessageReceived } from "../api/audio";

const audioDir = new Directory(Paths.document, "audio");

/**
 * Ensures the audio directory exists
 */
const ensureAudioDirectoryExists = async (): Promise<void> => {
  if (!audioDir.exists) {
    await audioDir.create();
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
export const audioFileExists = (messageId: string): boolean => {
  const file = getAudioFile(messageId);
  return file.exists;
};

/**
 * Gets all stored message IDs from local audio files
 */
export const getStoredMessages = (): File[] => {
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
 * Downloads and saves audio file to local storage
 */
export const downloadAndSaveAudio = async (
  messageId: string,
  token: string,
): Promise<string> => {
  await ensureAudioDirectoryExists();

  const file = getAudioFile(messageId);
  const downloadUrl = `${API_URL}/api/messages/download?id=${messageId}`;

  const downloadedFile = await File.downloadFileAsync(downloadUrl, file, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return downloadedFile.uri;
};

/**
 * Gets local audio URI if exists
 */
export const getAudioUri = (
  messageId: string,
  token: string,
): string | null => {
  const file = getAudioFile(messageId);

  if (file.exists) {
    return file.uri;
  }

  return null;
};

/**
 * Downloads audio file
 */
export const prefetchAudioMessage = async (
  messageId: string,
  token: string,
): Promise<void> => {
  if (audioFileExists(messageId)) {
    return;
  }

  await downloadAndSaveAudio(messageId, token);
  await markMessageReceived(messageId, token);
};

/**
 * Prefetches multiple audio files in parallel and returns IDs of successfully downloaded files
 */
export const prefetchUserAudioMessages = async (
  token: string,
): Promise<string[]> => {
  const messageIds = (await getMessages(token)).map((message) => message.id);

  const results = await Promise.allSettled(
    messageIds.map(async (id) => {
      await prefetchAudioMessage(id, token);
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
export const deleteAudioFile = async (messageId: string): Promise<void> => {
  const file = getAudioFile(messageId);

  if (file.exists) {
    file.delete();
  }
};

/**
 * Deletes all locally stored audio files
 */
export const clearAllAudioFiles = async (): Promise<void> => {
  if (audioDir.exists) {
    audioDir.delete();
  }
};
