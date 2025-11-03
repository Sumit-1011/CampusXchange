import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const useChatSocket = ({ userId, onMessageReceived, onRateLimitExceeded }) => {
  const socketRef = useRef(null);
  const joinedChatsRef = useRef(new Set());

  useEffect(() => {
    if (!userId || socketRef.current) return;

    const newSocket = io("http://localhost:8080", { query: { userId } });
    socketRef.current = newSocket;

    newSocket.on("receiveMessage", (message) => {
      if (onMessageReceived) {
        // ✅ Only trigger if valid message with _id
        if (message && message._id) {
          onMessageReceived(message);
        }
      }
    });

    newSocket.on("rateLimitExceeded", (msg) => {
      if (onRateLimitExceeded) onRateLimitExceeded(msg);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      joinedChatsRef.current.clear();
    };
  }, [userId, onMessageReceived, onRateLimitExceeded]);

  const joinChat = useCallback(
    (chatId) => {
      if (socketRef.current && chatId && !joinedChatsRef.current.has(chatId)) {
        socketRef.current.emit("joinChat", { chatId, userId });
        joinedChatsRef.current.add(chatId);
      }
    },
    [userId]
  );

  const sendMessage = useCallback((chatId, senderId, text, messageUUID) => {
    if (socketRef.current && text.trim()) {
      socketRef.current.emit("sendMessage", {
        chatId,
        senderId,
        text,
        messageUUID,
      });
    }
  }, []);

  return { joinChat, sendMessage };
};

export default useChatSocket;
