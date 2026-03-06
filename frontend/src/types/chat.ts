// Chat Group types
export interface ChatGroup {
  id: number;
  trip_vacancy_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

// Chat Member types
export interface ChatMember {
  id: number;
  chat_group_id: number;
  user_id: number;
  joined_at: string;
}

// Chat Message types
export interface ChatMessage {
  id: number;
  chat_group_id: number;
  sender_id: number;
  content: string;
  created_at: string;
}

// WebSocket Message Types
export type WebSocketMessageType =
  | "connection"
  | "message"
  | "typing"
  | "user_joined"
  | "user_left"
  | "error";

// WebSocket Messages You Send
export interface WSOutgoingMessage {
  type: "message";
  content: string;
}

export interface WSOutgoingTyping {
  type: "typing";
  is_typing: boolean;
}

export type WSOutgoingPayload = WSOutgoingMessage | WSOutgoingTyping;

// WebSocket Messages You Receive
export interface WSConnectionMessage {
  type: "connection";
  status: "connected";
  chat_group_id: number;
  timestamp: string;
}

export interface WSIncomingMessage {
  type: "message";
  id: number;
  chat_group_id: number;
  sender_id: number;
  content: string;
  created_at: string;
}

export interface WSTypingMessage {
  type: "typing";
  user_id: number;
  is_typing: boolean;
  timestamp: string;
}

export interface WSUserJoinedMessage {
  type: "user_joined";
  user_id: number;
  timestamp: string;
}

export interface WSUserLeftMessage {
  type: "user_left";
  user_id: number;
  timestamp: string;
}

export interface WSErrorMessage {
  type: "error";
  message: string;
}

export type WSIncomingPayload =
  | WSConnectionMessage
  | WSIncomingMessage
  | WSTypingMessage
  | WSUserJoinedMessage
  | WSUserLeftMessage
  | WSErrorMessage;

// Local Message State (for UI)
export interface LocalChatMessage {
  id: number;
  senderId: number;
  content: string;
  createdAt: Date;
  senderName?: string;
  senderEmail?: string;
  senderPhotoUrl?: string;
}

// API Request/Response types
export interface SendMessageRequest {
  content: string;
}

export interface ChatGroupListParams {
  skip?: number;
  limit?: number;
}

export interface ChatMessagesParams {
  skip?: number;
  limit?: number;
}

export interface RecentMessagesParams {
  limit?: number;
}
