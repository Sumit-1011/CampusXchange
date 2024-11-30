import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const useChatSocket = ({ userId, onMessageReceived, onRateLimitExceeded }) => {
  const socketRef = useRef(null);
  const joinedChatsRef = useRef(new Set());

  useEffect(() => {
    if (!userId || socketRef.current) return;

    console.log("Initializing WebSocket for userId:", userId);
    const newSocket = io("http://localhost:5000", {
      query: { userId },
    });
    socketRef.current = newSocket;

    newSocket.on("receiveMessage", (message) => {
      if (onMessageReceived) onMessageReceived(message);
    });

    newSocket.on("rateLimitExceeded", (msg) => {
      if (onRateLimitExceeded) onRateLimitExceeded(msg);
    });

    return () => {
      console.log("Cleaning up WebSocket...");
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
        console.log("Joining chat:", { chatId, userId });
        socketRef.current.emit("joinChat", { chatId, userId });
        joinedChatsRef.current.add(chatId);
      }
    },
    [userId]
  );

  const sendMessage = useCallback((chatId, senderId, text) => {
    if (socketRef.current && text.trim()) {
      console.log("Sending message:", { chatId, senderId, text });
      socketRef.current.emit("sendMessage", { chatId, senderId, text });
    }
  }, []);

  return { joinChat, sendMessage };
};

export default useChatSocket;
