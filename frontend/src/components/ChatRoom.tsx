import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useChatWebSocket } from "../hooks/useChatWebSocket";
import { chatApi } from "../api/chatApi";
import { profilesApi } from "../api/profilesApi";
import type { ProfileDetailResponse } from "../types/profile";
import "./ChatRoom.css";

interface ChatRoomProps {
  chatGroupId: number;
  token: string;
  currentUserId: number;
  chatGroupName?: string;
}

interface UserInfo {
  userId: number;
  name: string;
  email: string;
  photoUrl?: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  chatGroupId,
  token,
  currentUserId,
  chatGroupName,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userInfoMap, setUserInfoMap] = useState<Map<number, UserInfo>>(
    new Map(),
  );
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [members, setMembers] = useState<
    Array<{ user_id: number; joined_at: string }>
  >([]);
  const [failedAvatars, setFailedAvatars] = useState<Set<number>>(new Set());

  const handleAvatarError = (userId: number) => {
    setFailedAvatars((prev) => new Set(prev).add(userId));
  };
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isConnected,
    typingUsers,
    activeUsers,
    sendMessage,
    sendTypingIndicator,
    loadMessageHistory,
    error,
    reconnect,
  } = useChatWebSocket({
    chatGroupId,
    token,
    enabled: true,
  });

  // Load message history on mount
  useEffect(() => {
    loadMessageHistory();
  }, [loadMessageHistory]);

  // Fetch chat members and their profiles
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersList = await chatApi.getChatMembers(token, chatGroupId);
        setMembers(membersList);

        // Fetch profile for each member
        const newUserInfoMap = new Map<number, UserInfo>();

        await Promise.all(
          membersList.map(async (member) => {
            try {
              // Try fetching profile - profile ID might match user ID
              const profile = await profilesApi.getProfile(member.user_id);

              // Transform photo URL for browser display
              let photoUrl = profile.profile_photo_url || profile.profile_photo;
              if (photoUrl && !photoUrl.startsWith("http")) {
                const apiBase =
                  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
                photoUrl = `${apiBase}/${photoUrl.replace(/^\//, "")}`;
              }
              if (photoUrl?.includes("minio:9000")) {
                photoUrl = photoUrl.replace(
                  "http://minio:9000",
                  "http://localhost:9000",
                );
              }

              newUserInfoMap.set(member.user_id, {
                userId: member.user_id,
                name: `${profile.first_name} ${profile.last_name}`,
                email: "",
                photoUrl: photoUrl || undefined,
              });
            } catch (err) {
              // If profile fetch fails, use fallback
              console.log(
                `Profile not found for user ${member.user_id}, using fallback`,
              );
              newUserInfoMap.set(member.user_id, {
                userId: member.user_id,
                name: `User ${member.user_id}`,
                email: "",
                photoUrl: undefined,
              });
            }
          }),
        );

        setUserInfoMap(newUserInfoMap);
      } catch (err) {
        console.error("Failed to fetch members:", err);
      }
    };

    fetchMembers();
  }, [chatGroupId, token]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Send typing indicator
    if (value && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    sendMessage(inputValue);
    setInputValue("");

    // Clear typing indicator
    if (isTyping) {
      setIsTyping(false);
      sendTypingIndicator(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOwnMessage = (senderId: number) => senderId === currentUserId;

  const otherTypingUsers = Array.from(typingUsers).filter(
    (userId) => userId !== currentUserId,
  );

  return (
    <>
      <div className="chat-room">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <h2 className="chat-title">{chatGroupName || "Chat"}</h2>
            <div className="chat-status">
              <span
                className={`status-indicator ${isConnected ? "connected" : "disconnected"}`}
              >
                {isConnected ? "●" : "●"}
              </span>
              <span className="status-text">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
          <div className="chat-header-actions">
            <button
              onClick={() => setShowMembersModal(true)}
              className="members-button"
              title="View members"
            >
              👥 {members.length}
            </button>
            <div className="active-users-count">
              {activeUsers.size} {activeUsers.size === 1 ? "user" : "users"}{" "}
              online
            </div>
            {error && !isConnected && (
              <button onClick={reconnect} className="reconnect-button">
                Reconnect
              </button>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="chat-error-banner">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Messages Container */}
        <div className="messages-container" ref={messagesContainerRef}>
          {messages.length === 0 && (
            <div className="no-messages">
              <p>No messages yet. Start the conversation! 🚀</p>
            </div>
          )}

          {messages.map((msg, index) => {
            const showDate =
              index === 0 ||
              formatDate(messages[index - 1].createdAt) !==
                formatDate(msg.createdAt);

            const senderInfo = userInfoMap.get(msg.senderId);
            const senderName = senderInfo?.name || `User ${msg.senderId}`;
            const senderPhoto = senderInfo?.photoUrl;
            const isOwn = isOwnMessage(msg.senderId);

            return (
              <React.Fragment key={msg.id}>
                {showDate && (
                  <div className="message-date-divider">
                    {formatDate(msg.createdAt)}
                  </div>
                )}
                <div
                  className={`message ${isOwn ? "message-own" : "message-other"}`}
                >
                  {!isOwn && (
                    <div className="message-avatar">
                      {senderPhoto && !failedAvatars.has(msg.senderId) ? (
                        <img
                          src={senderPhoto}
                          alt={senderName}
                          className="avatar-image"
                          onError={() => handleAvatarError(msg.senderId)}
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {senderName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="message-bubble">
                    {!isOwn && (
                      <div className="message-sender">{senderName}</div>
                    )}
                    <div className="message-content">{msg.content}</div>
                    <div className="message-time">
                      {formatTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {otherTypingUsers.length > 0 && (
          <div className="typing-indicator">
            <span className="typing-dots">
              <span>●</span>
              <span>●</span>
              <span>●</span>
            </span>
            <span className="typing-text">
              {otherTypingUsers.length === 1
                ? "Someone is typing..."
                : `${otherTypingUsers.length} people are typing...`}
            </span>
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="message-input-form">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type a message..."
            disabled={!isConnected}
            className="message-input"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!isConnected || !inputValue.trim()}
            className="send-button"
          >
            Send
          </button>
        </form>
      </div>

      {/* Members Modal - Rendered via Portal to bypass overflow clipping */}
      {showMembersModal &&
        createPortal(
          <>
            <div
              className="modal-overlay"
              onClick={() => setShowMembersModal(false)}
            />
            <div className="members-modal">
              <div className="members-modal-header">
                <h3>Group Members ({members.length})</h3>
                <button
                  className="close-modal-button"
                  onClick={() => setShowMembersModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="members-list">
                {members.map((member) => {
                  const isOnline = activeUsers.has(member.user_id);
                  const userInfo = userInfoMap.get(member.user_id);
                  const userName = userInfo?.name || `User ${member.user_id}`;
                  const userPhoto = userInfo?.photoUrl;

                  return (
                    <div key={member.user_id} className="member-item">
                      <div className="member-avatar">
                        {userPhoto && !failedAvatars.has(member.user_id) ? (
                          <img
                            src={userPhoto}
                            alt={userName}
                            className="avatar-image"
                            onError={() => handleAvatarError(member.user_id)}
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {isOnline && <div className="online-indicator" />}
                      </div>
                      <div className="member-info">
                        <div className="member-name">
                          {userName}
                          {member.user_id === currentUserId && " (You)"}
                        </div>
                        <div className="member-status">
                          {isOnline ? "Online" : "Offline"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
};
