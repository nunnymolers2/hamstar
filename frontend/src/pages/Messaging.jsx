import { useState } from "react";

import user1 from "../assets/images/user.svg";
import user2 from "../assets/images/user.svg";
import user3 from "../assets/images/user.svg";

const contacts = [
  { id: 1, name: "John Doe", Avatar: user1 },
  { id: 2, name: "Bob", Avatar: user2 },
  { id: 3, name: "Charlie", Avatar: user3 },
];

export default function MessagingApp() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || !selectedChat) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setMessages((prev) => ({
      ...prev,
      [selectedChat.id]: [
        ...(prev[selectedChat.id] || []),
        { text: input, time, sender: "me" },
      ],
    }));
    setInput("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r overflow-y-auto h-screen">
        <h2 className="p-4 font-bold text-lg border-b">Chats</h2>
        {contacts.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedChat(c)}
            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 ${
              selectedChat?.id === c.id ? "bg-gray-200" : ""
            }`}
          >
            <img src={c.Avatar} alt={c.name} className="w-10 h-10 rounded-full" />
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-gray-500">Click to chat</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat window */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        {selectedChat ? (
          <>
            <div className="flex items-center gap-3 p-4 bg-white border-b flex-shrink-0">
              <img src={selectedChat.Avatar} alt={selectedChat.name} className="w-10 h-10 rounded-full" />
              <p className="font-medium">{selectedChat.name}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {(messages[selectedChat.id] || []).map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"} mb-2`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg max-w-xs ${
                      m.sender === "me" ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-800"
                    }`}
                  >
                    <p>{m.text}</p>
                    <span className="text-[10px] opacity-70 block mt-1">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 p-3 border-t bg-white flex-shrink-0">
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
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
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
