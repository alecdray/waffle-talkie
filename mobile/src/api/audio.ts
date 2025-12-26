import { File } from "expo-file-system";
import {
  AudioMessage,
  MarkReceivedRequest,
  MarkReceivedResponse,
  MessagesResponse,
  UploadAudioResponse,
} from "../types/audio";
import { ApiClient } from "./client";
import { API_URL, createHeaders } from "./config";

export class AudioClient {
  constructor(private api: ApiClient) {}

  uploadAudio = async (
    audioUri: string,
    duration: number,
  ): Promise<UploadAudioResponse> => {
    const formData = new FormData();

    const audioBlob = {
      uri: audioUri,
      type: "audio/m4a",
      name: "audio.m4a",
    } as any;

    formData.append("audio", audioBlob);
    formData.append("duration", duration.toString());

    const response = await this.api.fetchJson<UploadAudioResponse>(
      "/api/messages/upload",
      {
        method: "POST",
        body: formData,
      },
    );

    return response;
  };

  getMessages = async (): Promise<AudioMessage[]> => {
    const response = await this.api.fetchJson<MessagesResponse>(
      "/api/messages",
      {
        method: "GET",
      },
    );

    return response.messages;
  };

  downloadAndSaveAudio = async (
    messageId: string,
    file: File,
  ): Promise<string> => {
    const downloadUrl = `${API_URL}/api/messages/download?id=${messageId}`;

    const downloadedFile = await File.downloadFileAsync(downloadUrl, file, {
      headers: {
        Authorization: `Bearer ${this.api.token}`,
      },
    });

    return downloadedFile.uri;
  };

  markMessageReceived = async (
    messageId: string,
  ): Promise<MarkReceivedResponse> => {
    const response = await this.api.fetchJson<MarkReceivedResponse>(
      "/api/messages/received",
      {
        method: "POST",
        body: JSON.stringify({ message_id: messageId }),
      },
    );

    return response;
  };
}
