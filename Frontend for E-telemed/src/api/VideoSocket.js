import { io } from "socket.io-client";

export const SOCKET_URL = "http://localhost:5000"; // Your server URL

export const getVideoSocket = () => {
  const token = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("id");
  const role = localStorage.getItem("userRole");

  return io(SOCKET_URL, {
    query: { token, userId, role },
  });
};