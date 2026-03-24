import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { AppSidebar } from "../components/AppSidebar";
import { NotificationButton } from "../components/NotificationButton";
import { ThemeToggle } from "../components/ThemeToggle";
import { BottomNav } from "../components/BottomNav";
import { ChatGroupList } from "../components/ChatGroupList";
import { ChatRoom } from "../components/ChatRoom";
import { chatApi } from "../api/chatApi";
import type { ChatGroup } from "../types/chat";
import "./Chat.css";

export function Chat() {
  const { getAccessToken, clearAuth, user } = useAuth();
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const accessToken = getAccessToken();
  const userId = user?.id;

  if (!accessToken || !userId) {
    navigate("/login");
    return null;
  }

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

  const handleBackToList = () => {
    navigate("/chat");
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="app-layout">
        <AppSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
          onLogout={handleLogout}
        />

        <header className="app-header">
          <div className="app-header-left">
            <button
              type="button"
              className="menu-button"
              onClick={toggleSidebar}
              aria-label="Open menu"
              aria-expanded={isSidebarOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span>TripMate</span>
          </div>
          <div className="app-header-right">
            {selectedGroup && (
              <button onClick={handleBackToList} className="back-button">
                Back to Chats
              </button>
            )}
            <ThemeToggle />
            <NotificationButton />
          </div>
        </header>

        <main className="app-content chat-app-content">
          <div className="chat-page">
            {/* Chat title bar */}
            <div className="chat-page-titlebar">
              <h1 className="chat-page-title">
                {selectedGroup ? selectedGroup.name : "Messages"}
              </h1>
            </div>

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
                      <div className="chat-page-empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </>
  );
}
