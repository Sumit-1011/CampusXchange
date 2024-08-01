import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";

const Chat = ({ selectedContact, currentUser, chatId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!chatId) {
      console.log("No chat ID provided");
      return; // Prevent fetching messages if chatId is not available
    }

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await axios.get(`/api/messages/${chatId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [chatId]);

  const sendMessage = async () => {
    if (!chatId) {
      console.log("Cannot send message. No chat ID available.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.post(
        "/api/messages",
        {
          chatId: chatId,
          senderId: currentUser._id,
          receiverId: selectedContact._id,
          content: newMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages([...messages, response.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!chatId) {
    return (
      <div>No chat ID provided. Please select a contact to start chatting.</div>
    );
  }

  return (
    <div className="chat">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className="message">
            <p>{message.content}</p>
          </div>
        ))}
      </div>
      <div className="input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

Chat.propTypes = {
  selectedContact: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    chatId: PropTypes.string,
  }).isRequired,
  currentUser: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }).isRequired,
  chatId: PropTypes.string,
};

export default Chat;
