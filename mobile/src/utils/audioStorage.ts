import { Directory, File, Paths } from "expo-file-system";
import { API_URL } from "../api/config";
import { markMessageReceived } from "../api/audio";

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

  await markMessageReceived(messageId, token);

  return downloadedFile.uri;
};

/**
 * Gets local audio URI if exists, otherwise downloads and saves it
 */
export const getAudioUri = async (
  messageId: string,
  token: string,
): Promise<string> => {
  const file = getAudioFile(messageId);

  if (file.exists) {
    return file.uri;
  }

  return await downloadAndSaveAudio(messageId, token);
};

/**
 * Deletes a local audio file
 */
export const deleteAudioFile = async (messageId: string): Promise<void> => {
  const file = getAudioFile(messageId);

  if (file.exists) {
    await file.delete();
  }
};

/**
 * Deletes all locally stored audio files
 */
export const clearAllAudioFiles = async (): Promise<void> => {
  if (audioDir.exists) {
    await audioDir.delete();
  }
};
