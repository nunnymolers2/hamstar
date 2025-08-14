import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";
import { useMessaging } from "../context/MessagingContext";
import useSocket from "../hooks/useSocket";
import defaultAvatar from "../assets/images/user.svg";

export default function MessagingApp() {
  const {
    conversations,
    setConversations,
    users,
    setUsers,
    loading,
    setLoading,
    error,
    setError,
    refreshConversations,
  } = useMessaging();

  const location = useLocation();
  const navigate = useNavigate();
  const socket = useSocket();

  const [selectedChat, setSelectedChat] = useState(
    location.state?.selectedChat || null
  );
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Data fetching functions
  const fetchUsers = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
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
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      setError("Failed to load conversations");
      setConversations([]);
    }
  };

  const startNewConversation = async (otherUserId) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.post(
        "/api/messages/start-conversation",
        { otherUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setConversations((prev) => [...prev, response.data]);
        setSelectedChat({
          id: otherUserId,
          conversationId: response.data.conversationId,
          name: response.data.participantName,
          avatar: response.data.participantAvatar,
        });
        return response.data.conversationId;
      }
    } catch (err) {
      console.error("Error starting conversation:", err);
      setError("Failed to start conversation");
      return null;
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchUsers(), fetchConversations()]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Socket message handling
  useEffect(() => {
    if (!selectedChat || !socket.current) return;

    const conversation = conversations.find(
      (c) =>
        c.participants.includes(selectedChat.id) &&
        c.participants.includes(auth.currentUser.uid)
    );

    if (conversation) {
      socket.current.emit("joinConversation", conversation._id);
    }

    const handleMessage = (message) => {
      if (
        (message.senderId === selectedChat.id ||
          message.senderId === auth.currentUser.uid) &&
        !messages.some((m) => m._id === message._id)
      ) {
        setMessages((prev) => [...prev, formatMessage(message)]);
      }
    };

    socket.current.on("newMessage", handleMessage);
    return () => socket.current.off("newMessage", handleMessage);
  }, [selectedChat, conversations, messages, socket]);

  // Fetch messages for selected chat
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat) return;
      try {
        const token = await auth.currentUser.getIdToken();
        const { data } = await axios.get(
          `/api/messages/conversation/${selectedChat.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(data.messages.map(formatMessage));
      } catch (err) {
        setError(err.message);
      }
    };
    loadMessages();
  }, [selectedChat]);

  // Helper functions
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

    const tempId = Date.now().toString();
    try {
      const newMessage = {
        text: input,
        senderId: auth.currentUser.uid,
        receiverId: selectedChat.id,
        timestamp: new Date().toISOString(),
      };

      // Optimistic update
      setMessages((prev) => [
        ...prev,
        formatMessage({ ...newMessage, _id: tempId }),
      ]);

      const token = await auth.currentUser.getIdToken();
      socket.current.emit("sendMessage", newMessage);
      await axios.post(
        "/api/messages/send",
        { receiverId: selectedChat.id, text: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInput("");
    } catch (err) {
      setError(err.message);
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
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
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-bold text-lg">Chats</h2>
          <button
            onClick={refreshConversations}
            className="text-blue-500 hover:text-blue-700"
          >
            Refresh
          </button>
        </div>

        {conversations.map((conversation) => {
          const chatUser = getChatUser(conversation);
          if (!chatUser) return null;

          return (
            <div
              key={conversation._id}
              onClick={() => {
                setSelectedChat({
                  id: chatUser.id,
                  conversationId: conversation._id,
                  name: chatUser.name,
                  avatar: chatUser.avatar,
                });
                navigate(".", {
                  state: { selectedChat: chatUser },
                  replace: true,
                });
              }}
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
                messages.map((message) => (
                  <div
                    key={message._id}
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
