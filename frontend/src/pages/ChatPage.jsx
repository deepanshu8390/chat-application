import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "../apiClient.js";
import { useAuth } from "../state/AuthContext.jsx";
import { useSocket } from "../state/SocketContext.jsx";

function ChatPage() {
  const [user, setUser] = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // Load users
  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await apiClient.get("/api/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to load users:", err);
        toast.error("Failed to load users");
      }
    }
    loadUsers();
  }, []);

  // Load messages when selecting user
  useEffect(() => {
    if (!selectedUser) return;
    async function loadMessages() {
      try {
        const res = await apiClient.get(`/api/messages/${selectedUser._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages:", err);
        toast.error("Failed to load messages");
      }
    }
    loadMessages();
  }, [selectedUser]);

  // 🔥 Realtime listener FIXED
  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      if (!selectedUser) return;

      const senderId = msg.senderId?.toString();
      const receiverId = msg.receiverId?.toString();

      if (senderId === selectedUser._id || receiverId === selectedUser._id) {
        setMessages((prev) => [...prev, msg]);
        // Play notification sound
        const audio = new Audio("/notification.mp3"); // Add a sound file to public folder
        audio.play().catch(() => {}); // Ignore errors if sound fails
      }
    };

    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [socket, selectedUser]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser) return;

    try {
      const res = await apiClient.post(`/api/messages/${selectedUser._id}`, {
        text,
      });
      setMessages((prev) => [...prev, res.data]);
      setText("");
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message");
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("mychatapp:user");
    setUser(null);
  };

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Chats</h2>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>

        <div className="chat-user-list">
          {users.map((u) => {
            const isOnline = onlineUsers.includes(u._id);
            return (
              <div
                key={u._id}
                className={
                  "chat-user-item" +
                  (selectedUser && selectedUser._id === u._id
                    ? " chat-user-item--active"
                    : "")
                }
                onClick={() => setSelectedUser(u)}
              >
                <div className="avatar-circle">
                  {(u.mobile || "U").charAt(0).toUpperCase()}
                  {isOnline && <span className="online-dot" />}
                </div>
                <div className="chat-user-text">
                  <div className="chat-user-name">{u.mobile || "Unknown"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      <main className="chat-main">
        {!selectedUser ? (
          <div className="chat-empty">
            <h2>Hello, {user?.name}</h2>
            <p>Select a person on the left to start chatting.</p>
          </div>
        ) : (
          <div className="chat-thread">
            <header className="chat-thread-header">
              <div className="avatar-circle small">
                {(selectedUser.mobile || "U").charAt(0).toUpperCase()}
                {onlineUsers.includes(selectedUser._id) && <span className="online-dot" />}
              </div>
              <div>
                <div className="chat-user-name">{selectedUser.mobile || "Unknown"}</div>
                <div className="chat-user-email">
                  {onlineUsers.includes(selectedUser._id)
                    ? "Online"
                    : "Offline"}
                </div>
              </div>
            </header>

            <div className="chat-messages">
              {messages.map((m) => {
                const isMine =
                  m.senderId?.toString() === user._id;

                return (
                  <div
                    key={m._id}
                    className={
                      "chat-bubble" +
                      (isMine
                        ? " chat-bubble--mine"
                        : " chat-bubble--theirs")
                    }
                  >
                    {m.text}
                  </div>
                );
              })}

              {messages.length === 0 && (
                <p className="chat-hint">
                  Say hi to start the conversation.
                </p>
              )}
            </div>

            <form className="chat-input-bar" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Type your message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default ChatPage;
