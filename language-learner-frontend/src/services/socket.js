import io from "socket.io-client";
import store from "../store";

let socket = null;

export const initSocket = () => {
  const userId = store.state.user?._id;
  if (!userId) {
    console.error("Cannot initialize socket: User not authenticated");
    return null;
  }

  if (socket && socket.connected) {
    socket.disconnect();
  }

  socket = io("http://localhost:5000", { withCredentials: true });

  socket.on("connect", () => {
    console.log("🔗 Socket connected:", socket.id);
    socket.emit("register", { userId });
  });

  return socket;
};
