import React, { useState } from "react";
import PropTypes from "prop-types";
import Contacts from "./Contacts";
import Chat from "./Chat";
import axios from "axios";

const ChatInterface = ({ currentUser }) => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [chatId, setChatId] = useState(null);

  const handleContactSelect = async (contact) => {
    setSelectedContact(contact);

    // Check if a chat ID exists
    if (!contact.chatId) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "/api/messages/createChat",
          {
            senderId: currentUser._id,
            receiverId: contact._id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const newChat = response.data;
        setChatId(newChat._id);
        setSelectedContact((prev) => ({ ...prev, chatId: newChat._id }));
      } catch (error) {
        console.error("Error creating chat:", error);
      }
    } else {
      setChatId(contact.chatId);
    }
  };

  return (
    <div className="flex h-screen">
      <Contacts
        currentUser={currentUser}
        selectedContact={selectedContact}
        onSelectContact={handleContactSelect}
      />
      {selectedContact ? (
        <Chat
          selectedContact={selectedContact}
          currentUser={currentUser}
          chatId={chatId}
        />
      ) : (
        <div>Select a contact to start chatting</div>
      )}
    </div>
  );
};

ChatInterface.propTypes = {
  currentUser: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }).isRequired,
};

export default ChatInterface;
