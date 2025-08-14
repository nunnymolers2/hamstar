import { useState, useEffect } from "react";
import { auth } from "../firebase";
import axios from "axios";
import defaultAvatar from "../assets/images/user.svg";
import useSocket from "../hooks/useSocket";

export default function MessagingApp() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use socket via custom hook
  const socket = useSocket();

  // Messaging.jsx
  const startNewConversation = async (otherUserId) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.post(
        "/api/messages/start-conversation",
        { otherUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update your state with the new conversation
        setConversations((prev) => [...prev, response.data]);
        setSelectedChat({
          id: otherUserId,
          conversationId: response.data.conversationId,
        });
        return response.data.conversationId;
      }
    } catch (error) {
      console.error(
        "Error starting conversation:",
        error.response?.data || error.message
      );
      setError("Failed to start conversation");
      return null;
    }
  };

  const fetchUsers = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    }
  };

  const fetchConversations = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get("/api/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      setError("Failed to load conversations");
      setConversations([]);
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchUsers(), fetchConversations()]);
      } catch (err) {
        console.error("Initial data fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle socket events when chat is selected
  useEffect(() => {
    if (!selectedChat || !socket.current) return;

    // Join conversation room
    const conversation = conversations.find(
      (c) =>
        c.participants.includes(selectedChat.id) &&
        c.participants.includes(auth.currentUser.uid)
    );

    if (conversation) {
      socket.current.emit("joinConversation", conversation._id);
    }

    // Listen for new messages
    const handleNewMessage = (message) => {
      if (
        (message.senderId === selectedChat.id ||
          message.senderId === auth.currentUser.uid) &&
        !messages.some((m) => m._id === message._id)
      ) {
        setMessages((prev) => [...prev, formatMessage(message)]);
      }
    };

    socket.current.on("newMessage", handleNewMessage);

    return () => {
      socket.current.off("newMessage", handleNewMessage);
    };
  }, [selectedChat, conversations, messages, socket]);

  // Fetch messages when chat is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;

      try {
        const token = await auth.currentUser.getIdToken();
        const response = await axios.get(
          `/api/messages/conversation/${selectedChat.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(response.data.messages.map(formatMessage));
      } catch (err) {
        setError(err.message);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  const formatMessage = (message) => ({
    ...message,
    time: new Date(message.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    sender: message.senderId === auth.currentUser?.uid ? "me" : "them",
  });

  const handleSend = async () => {
    if (!input.trim() || !selectedChat || !socket.current) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const newMessage = {
        text: input,
        senderId: auth.currentUser.uid,
        receiverId: selectedChat.id,
        timestamp: new Date().toISOString(),
      };

      // Optimistic UI update
      setMessages((prev) => [
        ...prev,
        formatMessage({
          ...newMessage,
          _id: Date.now().toString(),
        }),
      ]);

      // Send via socket
      socket.current.emit("sendMessage", newMessage);

      // Also send via HTTP as fallback
      await axios.post(
        "/api/messages/send",
        { receiverId: selectedChat.id, text: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInput("");
    } catch (err) {
      setError(err.message);
      // Rollback optimistic update if needed
      setMessages((prev) =>
        prev.filter((m) => m._id !== Date.now().toString())
      );
    }
  };

  const getChatUser = (conversation) => {
    if (!conversation?.participants || !Array.isArray(users)) return null;
    return users.find(
      (u) =>
        u?.id !== auth.currentUser?.uid &&
        conversation.participants.includes(u.id)
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r overflow-y-auto">
        <h2 className="p-4 font-bold text-lg border-b">Chats</h2>

        {Array.isArray(conversations) &&
          conversations.map((conversation) => {
            const chatUser = getChatUser(conversation);
            if (!chatUser) return null;

            return (
              <div
                key={
                  conversation._id || Math.random().toString(36).substr(2, 9)
                }
                onClick={() => setSelectedChat(chatUser)}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 ${
                  selectedChat?.id === chatUser.id ? "bg-gray-200" : ""
                }`}
              >
                <img
                  src={chatUser.avatar || defaultAvatar}
                  alt={chatUser.name || "User"}
                  className="w-10 h-10 rounded-full"
                />
                <div className="overflow-hidden">
                  <p className="font-medium truncate">
                    {chatUser.name || "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {conversation.lastMessage?.text || "No messages yet"}
                  </p>
                </div>
              </div>
            );
          })}
      </div>

      {/* Chat window */}
      <div className="flex flex-col flex-1">
        {selectedChat ? (
          <>
            <div className="flex items-center gap-3 p-4 bg-white border-b">
              <img
                src={selectedChat.avatar || defaultAvatar}
                alt={selectedChat.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">{selectedChat.name}</p>
                <p className="text-xs text-gray-500">
                  {socket.current?.connected ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message, i) => (
                  <div
                    key={message._id || i}
                    className={`flex ${
                      message.sender === "me" ? "justify-end" : "justify-start"
                    } mb-2`}
                  >
                    <div
                      className={`px-3 py-2 rounded-lg max-w-xs ${
                        message.sender === "me"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-gray-800"
                      }`}
                    >
                      <p>{message.text}</p>
                      <span className="text-[10px] opacity-70 block mt-1">
                        {message.time}
                        {message.sender === "me" && message.read && (
                          <span className="ml-1">✓✓</span>
                        )}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-2 p-3 border-t bg-white">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 border rounded-full px-4 py-2 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-2 rounded-full ${
                  input.trim()
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
