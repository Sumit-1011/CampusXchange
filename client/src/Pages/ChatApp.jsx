import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import useChatData from "../hooks/useChatData";

const ChatApp = () => {
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    contacts,
    selectedContact,
    messages,
    currentUserId,
    loading,
    handleSelectContact,
    sendMessage,
  } = useChatData(chatId, navigate, location);

  // Memoize the sendMessage handler to pass to ChatWindow
  const handleSendMessage = useCallback(
    (text) => {
      if (selectedContact && currentUserId) {
        sendMessage(selectedContact.chatId, currentUserId, text);
      }
    },
    [sendMessage, selectedContact, currentUserId]
  );

  if (loading || !currentUserId) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <ChatSidebar
        contacts={contacts}
        onSelectContact={handleSelectContact}
        selectedContact={selectedContact}
      />
      {selectedContact ? (
        <ChatWindow
          messages={messages}
          selectedContact={selectedContact}
          currentUserId={currentUserId}
          sendMessage={handleSendMessage}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Please select a user to start a chat.
        </div>
      )}
    </div>
  );
};

export default ChatApp;
