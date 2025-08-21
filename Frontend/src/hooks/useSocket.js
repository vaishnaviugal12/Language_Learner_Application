import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function useSocket(token) {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      auth: { token },
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [token]);

  return socketRef.current;
}
