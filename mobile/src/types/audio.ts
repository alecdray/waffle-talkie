export interface AudioMessage {
  id: string;
  sender_user_id: string;
  file_path: string;
  duration: number;
  created_at: string;
  deleted_at: string | null;
}

export interface UploadAudioRequest {
  audio: File | Blob;
  duration: number;
}

export interface UploadAudioResponse {
  message_id: string;
  message: string;
}

export interface MessagesResponse {
  messages: AudioMessage[];
}

export interface MarkReceivedRequest {
  message_id: string;
}

export interface MarkReceivedResponse {
  message: string;
}
