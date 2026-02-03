import { useEffect, useRef, useState } from "react";
import { getVideoSocket } from "../sockets/videoSocket";

export const useVideoCall = (roomId, role) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const socketRef = useRef(null);
  const [status, setStatus] = useState("Waiting for participant...");

  useEffect(() => {
    if (!roomId) return;

    socketRef.current = getVideoSocket();
    socketRef.current.emit("join-room", { roomId, role });

    // Get local media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        peerRef.current = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        stream.getTracks().forEach(track => peerRef.current.addTrack(track, stream));

        peerRef.current.ontrack = (event) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
          setStatus("Connected ✔");
        };

        peerRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            socketRef.current.emit("signal", {
              type: "ice-candidate",
              candidate: event.candidate,
              roomId,
            });
          }
        };

        if (role === "PATIENT") {
          // Initiate call
          peerRef.current.createOffer()
            .then(offer => peerRef.current.setLocalDescription(offer))
            .then(() => {
              socketRef.current.emit("signal", { type: "offer", offer: peerRef.current.localDescription, roomId });
              setStatus("Calling doctor...");
            });
        }
      });

    socketRef.current.on("signal", async (data) => {
      if (!peerRef.current) return;

      if (data.type === "offer" && role === "DOCTOR") {
        await peerRef.current.setRemoteDescription(data.offer);
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        socketRef.current.emit("signal", { type: "answer", answer, roomId });
        setStatus("Connected ✔");
      } else if (data.type === "answer" && role === "PATIENT") {
        await peerRef.current.setRemoteDescription(data.answer);
        setStatus("Connected ✔");
      } else if (data.type === "ice-candidate") {
        try {
          await peerRef.current.addIceCandidate(data.candidate);
        } catch (err) {
          console.error("Error adding ICE candidate", err);
        }
      }
    });

    return () => {
      if (peerRef.current) peerRef.current.close();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [roomId, role]);

  return { localVideoRef, remoteVideoRef, status };
};