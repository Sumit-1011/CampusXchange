import { useState, useEffect } from "react";

const ChatWindow = ({
  messages,
  selectedContact,
  currentUserId,
  sendMessage,
}) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    //console.log("💬 Sending message text:", newMessage);
    sendMessage(newMessage);
    setNewMessage("");
  };

  useEffect(() => {
    const ids = messages.map(m => m._id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (duplicates.length) {
      console.warn("Duplicate message IDs detected:", duplicates);
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={`${msg._id}-${index}`}
            className={`mb-2 ${msg.sender === currentUserId ? "text-right" : "text-left"}`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                msg.sender === currentUserId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {msg.text}
              
            </span>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-300">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="p-2 w-4/5 rounded border border-gray-300"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
