import React, { useEffect, useState } from "react";
import { chatApi } from "../api/chatApi";
import type { ChatGroup } from "../types/chat";
import "./ChatGroupList.css";

interface ChatGroupListProps {
  token: string;
  onSelectGroup: (group: ChatGroup) => void;
  selectedGroupId?: number;
}

export const ChatGroupList: React.FC<ChatGroupListProps> = ({
  token,
  onSelectGroup,
  selectedGroupId,
}) => {
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        setLoading(true);
        const chatGroups = await chatApi.getMyChatGroups(token, {
          skip: 0,
          limit: 100,
        });
        setGroups(chatGroups);
        setError(null);
      } catch (err) {
        console.error("Failed to load chat groups:", err);
        setError("Failed to load chat groups");
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, [token]);

  if (loading) {
    return (
      <div className="chat-group-list">
        <div className="chat-group-list-header">
          <h3>Your Chats</h3>
        </div>
        <div className="chat-group-list-loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-group-list">
        <div className="chat-group-list-header">
          <h3>Your Chats</h3>
        </div>
        <div className="chat-group-list-error">{error}</div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="chat-group-list">
        <div className="chat-group-list-header">
          <h3>Your Chats</h3>
        </div>
        <div className="chat-group-list-empty">
          No chat groups yet. Join a trip to start chatting!
        </div>
      </div>
    );
  }

  return (
    <div className="chat-group-list">
      <div className="chat-group-list-header">
        <h3>Your Chats</h3>
        <span className="chat-group-count">{groups.length}</span>
      </div>
      <div className="chat-group-items">
        {groups.map((group) => (
          <div
            key={group.id}
            className={`chat-group-item ${selectedGroupId === group.id ? "active" : ""}`}
            onClick={() => onSelectGroup(group)}
          >
            <div className="chat-group-item-content">
              <h4 className="chat-group-name">{group.name}</h4>
              <p className="chat-group-date">
                Updated: {new Date(group.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div className="chat-group-arrow">›</div>
          </div>
        ))}
      </div>
    </div>
  );
};
