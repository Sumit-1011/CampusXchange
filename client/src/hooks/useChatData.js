import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import useChatSocket from "./useChatSocket";
import config from "../config";

const useChatData = (chatId, navigate, location) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const selectedContactRef = useRef(null);
  const currentUserIdRef = useRef(null);

  const { joinChat, sendMessage } = useChatSocket({
    userId: currentUserId,
    onMessageReceived: useCallback(
      (message) => setMessages((prev) => [...prev, message]),
      []
    ),
    onRateLimitExceeded: useCallback((msg) => alert(msg), []),
  });

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${config.apiBaseUrl}/api/chat/contacts`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status === "ok") {
          setContacts(response.data.contacts);

          if (chatId) {
            const contact = response.data.contacts.find(
              (c) => c.chatId === chatId
            );
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

  const fetchMessagesAndUserId = useCallback(async () => {
    if (!selectedContact?.chatId) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${config.apiBaseUrl}/api/chat/messages/${selectedContact.chatId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "ok") {
        setMessages(response.data.messages);
        setCurrentUserId(response.data.currentUser);
        currentUserIdRef.current = response.data.currentUser;
      }
    } catch (error) {
      console.error("Error fetching messages and userId:", error);
    }
  }, [selectedContact?.chatId]);

  useEffect(() => {
    selectedContactRef.current = selectedContact;

    fetchMessagesAndUserId();

    if (selectedContact?.chatId && currentUserId) {
      joinChat(selectedContact.chatId);
    }
  }, [selectedContact, currentUserId, fetchMessagesAndUserId, joinChat]);

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
    sendMessage,
  };
};

export default useChatData;
