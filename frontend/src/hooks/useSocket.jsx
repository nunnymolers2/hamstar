// src/hooks/useSocket.js
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { auth } from "../firebase"; // adjust path as needed

export default function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    const initializeSocket = async () => {
      const token = await auth.currentUser?.getIdToken();

      socketRef.current = io(import.meta.env.VITE_SOCKET_URL || "", {
        withCredentials: true,
        transports: ["websocket"],
        auth: { token },
      });

      // Connection handlers
      socketRef.current.on("connect", () => {
        console.log("Socket connected");
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    };

    initializeSocket().catch(console.error);
  }, []);

  return socketRef;
}
