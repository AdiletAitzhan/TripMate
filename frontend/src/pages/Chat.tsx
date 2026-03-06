import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { ChatGroupList } from "../components/ChatGroupList";
import { ChatRoom } from "../components/ChatRoom";
import { ThemeToggle } from "../components/ThemeToggle";
import { chatApi } from "../api/chatApi";
import type { ChatGroup } from "../types/chat";
import "./Chat.css";

export function Chat() {
  const { getAccessToken, user } = useAuth();
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);

  const accessToken = getAccessToken();
  const userId = user?.id;

  if (!accessToken || !userId) {
    navigate("/login");
    return null;
  }

  // Load selected group from URL parameter
  useEffect(() => {
    if (groupId && accessToken) {
      const loadGroup = async () => {
        try {
          const group = await chatApi.getChatGroup(
            accessToken,
            parseInt(groupId),
          );
          setSelectedGroup(group);
        } catch (err) {
          console.error("Failed to load chat group:", err);
          navigate("/chat");
        }
      };
      loadGroup();
    } else {
      setSelectedGroup(null);
    }
  }, [groupId, accessToken, navigate]);

  const handleSelectGroup = (group: ChatGroup) => {
    navigate(`/chat/${group.id}`);
  };

  const handleBackToHome = () => {
    navigate("/home");
  };

  const handleBackToList = () => {
    navigate("/chat");
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <header className="chat-page-header">
        <div className="chat-page-header-left">
          {selectedGroup ? (
            <button onClick={handleBackToList} className="back-button">
              ← Back to Chats
            </button>
          ) : (
            <button onClick={handleBackToHome} className="back-button">
              ← Back to Home
            </button>
          )}
          <h1 className="chat-page-title">
            {selectedGroup ? selectedGroup.name : "Messages"}
          </h1>
        </div>
        <div className="chat-page-header-right">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="chat-page-content">
        {/* Sidebar - Chat Group List */}
        <aside
          className={`chat-page-sidebar ${selectedGroup ? "hide-on-mobile" : ""}`}
        >
          <ChatGroupList
            token={accessToken}
            onSelectGroup={handleSelectGroup}
            selectedGroupId={selectedGroup?.id}
          />
        </aside>

        {/* Main - Chat Room */}
        <main
          className={`chat-page-main ${!selectedGroup ? "hide-on-mobile" : ""}`}
        >
          {selectedGroup ? (
            <ChatRoom
              key={selectedGroup.id}
              chatGroupId={selectedGroup.id}
              token={accessToken}
              currentUserId={parseInt(userId)}
              chatGroupName={selectedGroup.name}
            />
          ) : (
            <div className="chat-page-empty">
              <div className="chat-page-empty-content">
                <h2>Welcome to Messages</h2>
                <p>Select a chat group to start messaging</p>
                <div className="chat-page-empty-icon">💬</div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
