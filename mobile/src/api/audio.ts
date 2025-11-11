import {
  AudioMessage,
  MarkReceivedRequest,
  MarkReceivedResponse,
  MessagesResponse,
  UploadAudioResponse,
} from "../types/audio";
import { API_URL, createHeaders } from "./config";

export const uploadAudio = async (
  audioUri: string,
  duration: number,
  token: string
): Promise<UploadAudioResponse> => {
  const formData = new FormData();

  const audioBlob = {
    uri: audioUri,
    type: "audio/m4a",
    name: "audio.m4a",
  } as any;

  formData.append("audio", audioBlob);
  formData.append("duration", duration.toString());

  const response = await fetch(`${API_URL}/api/messages/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Upload failed");
  }

  return response.json();
};

export const getMessages = async (token: string): Promise<AudioMessage[]> => {
  const response = await fetch(`${API_URL}/api/messages`, {
    method: "GET",
    headers: createHeaders(token),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to fetch messages");
  }

  const data: MessagesResponse = await response.json();
  return data.messages;
};

export const downloadAudio = (messageId: string, token: string): string => {
  return `${API_URL}/api/messages/download?id=${messageId}`;
};

export const markMessageReceived = async (
  messageId: string,
  token: string
): Promise<MarkReceivedResponse> => {
  const response = await fetch(`${API_URL}/api/messages/received`, {
    method: "POST",
    headers: createHeaders(token),
    body: JSON.stringify({ message_id: messageId }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to mark message as received");
  }

  return response.json();
};
