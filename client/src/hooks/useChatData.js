import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import useChatSocket from "./useChatSocket";
import config from "../config";

const useChatData = (chatId, navigate, location) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const messageMapRef = useRef(new Map()); // ✅ Track messages uniquely
  const selectedContactRef = useRef(null);

  // --- SOCKET CONFIG ---
  const handleMessageReceived = useCallback((message) => {
    if (!message || !message._id) return;

    setMessages((prev) => {
      if (messageMapRef.current.has(message._id)) {
        return prev; // duplicate, ignore
      }
      messageMapRef.current.set(message._id, message);
      return [...prev, message];
    });
  }, []);

  const { joinChat, sendMessage: socketSendMessage } = useChatSocket({
    userId: currentUserId,
    onMessageReceived: handleMessageReceived,
    onRateLimitExceeded: (msg) => alert(msg),
  });

  // --- FETCH CONTACTS ---
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${config.apiBaseUrl}/api/chat/contacts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status === "ok") {
          setContacts(response.data.contacts);

          if (chatId) {
            const contact = response.data.contacts.find((c) => c.chatId === chatId);
            setSelectedContact(contact || null);
          } else if (location.state?.contact) {
            setSelectedContact(location.state.contact);
          }
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [chatId, location.state, navigate]);

  // --- FETCH MESSAGES ---
  const fetchMessagesAndUserId = useCallback(async () => {
    if (!selectedContact?.chatId) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${config.apiBaseUrl}/api/chat/messages/${selectedContact.chatId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "ok") {
        const uniqueMsgs = Array.from(
          new Map(
            response.data.messages.map((m) => [m._id.toString(), m])
          ).values()
        );
        messageMapRef.current = new Map(uniqueMsgs.map((m) => [m._id, m]));
        setMessages(uniqueMsgs);
        setCurrentUserId(response.data.currentUser);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [selectedContact?.chatId]);

  useEffect(() => {
    selectedContactRef.current = selectedContact;
    fetchMessagesAndUserId();

    if (selectedContact?.chatId && currentUserId) {
      joinChat(selectedContact.chatId);
    }
  }, [selectedContact, currentUserId, fetchMessagesAndUserId, joinChat]);

  // --- SEND MESSAGE ---
  const handleSendMessage = useCallback(
    async (textParam) => {
      const inputText = String(textParam).trim();
      if (!inputText || !selectedContact?.chatId || !currentUserId) return;

      const messageUUID = uuidv4();
      const tempMessage = {
        _id: messageUUID,
        chatId: selectedContact.chatId,
        sender: currentUserId,
        text: inputText,
        createdAt: new Date().toISOString(),
        pending: true,
      };

      setMessages((prev) => [...prev, tempMessage]);
      messageMapRef.current.set(tempMessage._id, tempMessage);

      socketSendMessage(selectedContact.chatId, currentUserId, inputText, messageUUID);
    },
    [selectedContact?.chatId, currentUserId, socketSendMessage]
  );


  // --- CONTACT SELECTION ---
  const handleSelectContact = useCallback(
    (contact) => {
      setSelectedContact(contact);
      navigate(`/chat/${contact.chatId}`, { state: { contact } });
    },
    [navigate]
  );

  return {
    contacts,
    selectedContact,
    messages,
    currentUserId,
    loading,
    handleSelectContact,
    sendMessage: handleSendMessage,
  };
};

export default useChatData;
