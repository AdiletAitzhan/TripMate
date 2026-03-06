import { useEffect, useRef, useState, useCallback } from "react";
import type {
  LocalChatMessage,
  WSIncomingPayload,
  WSOutgoingPayload,
} from "../types/chat";
import { chatApi } from "../api/chatApi";

interface UseChatWebSocketProps {
  chatGroupId: number | null;
  token: string | null;
  enabled?: boolean;
}

interface UseChatWebSocketReturn {
  messages: LocalChatMessage[];
  isConnected: boolean;
  typingUsers: Set<number>;
  activeUsers: Set<number>;
  sendMessage: (content: string) => void;
  sendTypingIndicator: (isTyping: boolean) => void;
  disconnect: () => void;
  reconnect: () => void;
  loadMessageHistory: () => Promise<void>;
  error: string | null;
}

export const useChatWebSocket = ({
  chatGroupId,
  token,
  enabled = true,
}: UseChatWebSocketProps): UseChatWebSocketReturn => {
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [activeUsers, setActiveUsers] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Load message history
  const loadMessageHistory = useCallback(async () => {
    if (!chatGroupId || !token || historyLoaded) return;

    try {
      const recentMessages = await chatApi.getRecentMessages(
        token,
        chatGroupId,
        {
          limit: 50,
        },
      );

      const localMessages: LocalChatMessage[] = recentMessages.map((msg) => ({
        id: msg.id,
        senderId: msg.sender_id,
        content: msg.content,
        createdAt: new Date(msg.created_at),
      }));

      setMessages(localMessages);
      setHistoryLoaded(true);
    } catch (err) {
      console.error("Failed to load message history:", err);
    }
  }, [chatGroupId, token, historyLoaded]);

  const connect = useCallback(() => {
    if (!chatGroupId || !token || !enabled) {
      return;
    }

    // Clear any existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const wsUrl = chatApi.getWebSocketUrl(chatGroupId, token);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected to chat group:", chatGroupId);
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: WSIncomingPayload = JSON.parse(event.data);

          switch (data.type) {
            case "connection":
              console.log(
                "Successfully connected to chat group",
                data.chat_group_id,
              );
              break;

            case "message":
              setMessages((prev) => {
                // Check if message already exists to prevent duplicates
                if (prev.some((msg) => msg.id === data.id)) {
                  return prev;
                }
                return [
                  ...prev,
                  {
                    id: data.id,
                    senderId: data.sender_id,
                    content: data.content,
                    createdAt: new Date(data.created_at),
                  },
                ];
              });
              break;

            case "typing":
              setTypingUsers((prev) => {
                const newSet = new Set(prev);
                if (data.is_typing) {
                  newSet.add(data.user_id);
                } else {
                  newSet.delete(data.user_id);
                }
                return newSet;
              });
              break;

            case "user_joined":
              setActiveUsers((prev) => new Set([...prev, data.user_id]));
              console.log(`User ${data.user_id} joined the chat`);
              break;

            case "user_left":
              setActiveUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(data.user_id);
                return newSet;
              });
              console.log(`User ${data.user_id} left the chat`);
              break;

            case "error":
              console.error("WebSocket error message:", data.message);
              setError(data.message);
              break;

            default:
              console.warn("Unknown message type:", (data as any).type);
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      ws.onerror = (event) => {
        console.error("WebSocket error:", event);
        setError("WebSocket connection error");
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Handle specific close codes
        if (event.code === 1008) {
          // Policy violation (invalid token or not a member)
          setError("Authentication failed or not a chat member");
          console.error("WebSocket closed due to policy violation");
          return;
        }

        // Auto-reconnect logic
        if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000,
          );

          console.log(
            `Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts}) in ${delay}ms...`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError("Failed to connect after multiple attempts");
        }
      };
    } catch (err) {
      console.error("Failed to create WebSocket connection:", err);
      setError("Failed to establish connection");
      setIsConnected(false);
    }
  }, [chatGroupId, token, enabled]);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const payload: WSOutgoingPayload = {
        type: "message",
        content: content,
      };
      wsRef.current.send(JSON.stringify(payload));
    } else {
      console.warn("WebSocket is not connected, cannot send message");
      setError("Not connected to chat");
    }
  }, []);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const payload: WSOutgoingPayload = {
        type: "typing",
        is_typing: isTyping,
      };
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setError(null);
    connect();
  }, [disconnect, connect]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log("Network back online, attempting to reconnect...");
      reconnect();
    };

    const handleOffline = () => {
      console.log("Network offline");
      setIsConnected(false);
      setError("Network connection lost");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [reconnect]);

  // Reset state when chatGroupId changes
  useEffect(() => {
    setMessages([]);
    setTypingUsers(new Set());
    setActiveUsers(new Set());
    setHistoryLoaded(false);
    setError(null);
  }, [chatGroupId]);

  // Connect/disconnect based on dependencies
  useEffect(() => {
    if (enabled && chatGroupId && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [chatGroupId, token, enabled, connect, disconnect]);

  return {
    messages,
    isConnected,
    typingUsers,
    activeUsers,
    sendMessage,
    sendTypingIndicator,
    disconnect,
    reconnect,
    loadMessageHistory,
    error,
  };
};
