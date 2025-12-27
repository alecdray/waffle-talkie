import { Directory, File, Paths } from "expo-file-system";
import { useClient } from "./use-client";
import { getStoredJson, storeJson } from "../store/store";
import { useEffect, useMemo, useState } from "react";

const MESSAGES_METADATA_STORAGE_KEY = "messages-metadata" as const;
const AUDIO_DIR_NAME = "audio";

export enum PlayedStatus {
  UNPLAYED = "UNPLAYED",
  STARTED = "STARTED",
  FINISHED = "FINISHED",
}

export interface StoredMessageMetadata {
  id: string;
  fileUri: string;
  senderUserId: string;
  playedStatus: PlayedStatus;
  duration?: number;
  createdAt: string;
  deletedAt?: string;
}

export interface StoredMessage {
  file: File;
  metadata: StoredMessageMetadata;
}

export type StoredMessagesMetadata = Record<string, StoredMessageMetadata>;

class LocalMessageStore {
  fileDir: Directory;

  constructor() {
    this.fileDir = new Directory(Paths.document, AUDIO_DIR_NAME);
    this.ensureAudioDirectoryExists();
  }

  private updateAllMetadata = async (
    metadata: StoredMessagesMetadata,
  ): Promise<void> => {
    await storeJson(MESSAGES_METADATA_STORAGE_KEY, metadata);
  };

  private upsertMetadata = async (
    metadata: StoredMessageMetadata,
  ): Promise<void> => {
    const messagesMetadata = await this.getAllMetadata();
    messagesMetadata[metadata.id] = metadata;
    await this.updateAllMetadata(messagesMetadata);
  };

  private getAllMetadata = async (): Promise<StoredMessagesMetadata> => {
    const metadata =
      (await getStoredJson<StoredMessagesMetadata>(
        MESSAGES_METADATA_STORAGE_KEY,
      )) ?? {};
    return metadata;
  };

  private deleteMetadata = async (messageId: string): Promise<void> => {
    const messagesMetadata = await this.getAllMetadata();
    delete messagesMetadata[messageId];

    await this.updateAllMetadata(messagesMetadata);
  };

  private deleteAllMetadata = async (): Promise<void> => {
    await this.updateAllMetadata({});
  };

  ensureAudioDirectoryExists = (): void => {
    if (!this.fileDir.exists) {
      this.fileDir.create();
    }
  };

  getMessageFileFromId = (messageId: string): File => {
    return new File(this.fileDir, `${messageId}.m4a`);
  };

  upsert = async (message: {
    file: File;
    metadata: Omit<StoredMessageMetadata, "fileUri">;
  }): Promise<void> => {
    if (!message.file.exists) {
      throw new Error(`File ${message.file.name} does not exist`);
    }

    const newMessage: StoredMessage = {
      ...message,
      metadata: {
        ...message.metadata,
        fileUri: message.file.uri,
      },
    };

    await this.upsertMetadata(newMessage.metadata);
  };

  get = async (messageId: string): Promise<StoredMessage | undefined> => {
    const messagesMetadata = await this.getAllMetadata();
    const messageMetadata = messagesMetadata[messageId];
    if (!messageMetadata) {
      return undefined;
    }

    const file = new File(messageMetadata.fileUri);
    const message: StoredMessage = { metadata: messageMetadata, file };
    return message;
  };

  getAll = async (): Promise<StoredMessage[]> => {
    const messagesMetadata = await this.getAllMetadata();
    const messages = Object.values(messagesMetadata).map((metadata) => {
      const file = new File(metadata.fileUri);
      const message: StoredMessage = { metadata, file };
      return message;
    });
    return messages;
  };

  delete = async (messageId: string): Promise<void> => {
    const messageMetadata = (await this.getAllMetadata())[messageId];
    if (!messageMetadata) {
      return;
    }

    const file = new File(messageMetadata.fileUri);
    file.delete();
    await this.deleteMetadata(messageId);
  };

  deleteAll = async (): Promise<void> => {
    this.fileDir.delete();
    await this.deleteAllMetadata();
    this.ensureAudioDirectoryExists();
  };
}

export const useAudio = () => {
  const store = useMemo(() => new LocalMessageStore(), []);

  const { getClient } = useClient();
  const [messages, setMessages] = useState<StoredMessage[] | null>(null);

  useEffect(() => {
    store.getAll().then((messages) => {
      setMessages(messages);
    });
  }, [store]);

  /**
   * Prefetches multiple audio files in parallel and returns IDs of successfully downloaded files
   */
  const prefetchUserAudioMessages = async () => {
    const api = await getClient();
    const messages = await api.audio.getMessages();

    (
      await Promise.allSettled(
        messages.map(async (message) => {
          const id = message.id;

          const file = store.getMessageFileFromId(id);

          const api = await getClient();
          if (!file.exists) {
            await api.audio.downloadAudio(id, file);
          }
          const storedMessage = await store.upsert({
            file,
            metadata: {
              id: id,
              senderUserId: message.sender_user_id,
              duration: message.duration,
              createdAt: message.created_at,
              deletedAt: message.deleted_at ?? undefined,
              playedStatus: PlayedStatus.UNPLAYED,
            },
          });
          await api.audio.markMessageReceived(id);
          return storedMessage;
        }),
      )
    ).forEach((result) => {
      if (result.status !== "fulfilled") {
        console.error(`Failed to download audio message ${result.reason}`);
      }
    });

    setMessages(await store.getAll());
  };

  /**
   * Deletes a local audio file
   */
  const deleteAudioFile = async (messageId: string): Promise<void> => {
    await store.delete(messageId);
    setMessages(await store.getAll());
  };

  /**
   * Deletes all locally stored audio files
   */
  const clearAllAudioFiles = async (): Promise<void> => {
    await store.deleteAll();
    setMessages(await store.getAll());
  };

  const updatePlayedStatus = async (
    messageId: string,
    status: PlayedStatus,
  ): Promise<void> => {
    const message = await store.get(messageId);
    if (!message) return;

    message.metadata.playedStatus = status;
    await store.upsert(message);
    setMessages(await store.getAll());
  };

  return {
    prefetchUserAudioMessages,
    deleteAudioFile,
    clearAllAudioFiles,
    messages,
    updatePlayedStatus,
  };
};
