import { File } from "expo-file-system";
import {
  AudioMessage,
  MarkReceivedResponse,
  MessagesResponse,
  UploadAudioResponse,
} from "../types/audio";
import { ApiClient } from "./client";
import { API_URL } from "./config";

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
      "/api/audio-messages/upload",
      {
        method: "POST",
        body: formData,
      },
    );

    return response;
  };

  getMessages = async (): Promise<AudioMessage[]> => {
    const response = await this.api.fetchJson<MessagesResponse>(
      "/api/audio-messages",
      {
        method: "GET",
      },
    );

    return response.messages;
  };

  downloadAudio = async (messageId: string, file: File): Promise<string> => {
    const downloadUrl = `${API_URL}/api/audio-messages/download?id=${messageId}`;

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
      "/api/audio-messages/received",
      {
        method: "POST",
        body: JSON.stringify({ message_id: messageId }),
      },
    );

    return response;
  };
}
