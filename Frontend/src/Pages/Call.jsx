import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axiosClient from "../utils/axiosClient"; // Axios instance with withCredentials already set

export default function Call({ roomId }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);

  const [iceServers, setIceServers] = useState([]);

  // 1. Get ICE servers from backend
  useEffect(() => {
    axiosClient.get("/ice-servers/get")
      .then((res) => {
        setIceServers(res.data.iceServers || []);
      })
      .catch((err) => {
        console.error("Error fetching ICE servers", err);
      });
  }, []);

  // 2. Setup WebRTC + socket connection
  useEffect(() => {
    if (!iceServers.length) return;

    // Connect with cookies automatically sent
    socketRef.current = io(import.meta.env.VITE_SERVER_URL, {
      withCredentials: true
    });

    // Join specific room for call
    socketRef.current.emit("join-room", roomId);

    // Create peer connection
    pcRef.current = new RTCPeerConnection({ iceServers });

    // Handle remote track
    pcRef.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    // Send ICE candidates to room
    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          roomId,
          candidate: event.candidate
        });
      }
    };

    // Receive offer
    socketRef.current.on("offer", async (offer) => {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socketRef.current.emit("answer", { roomId, answer });
    });

    // Receive answer
    socketRef.current.on("answer", async (answer) => {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    // Receive ICE candidate
    socketRef.current.on("ice-candidate", async (candidate) => {
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ICE candidate", err);
      }
    });

    return () => {
      socketRef.current.disconnect();
      pcRef.current.close();
    };
  }, [iceServers, roomId]);

  // 3. Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) =>
        pcRef.current.addTrack(track, stream)
      );
    } catch (err) {
      console.error("Error accessing camera/mic", err);
    }
  };

  // 4. Create offer and send to room
  const startCall = async () => {
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    socketRef.current.emit("offer", { roomId, offer });
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Video Call</h1>
      <div className="flex gap-4">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-64 h-48 bg-black"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-64 h-48 bg-black"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={startCamera}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Start Camera
        </button>
        <button
          onClick={startCall}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Start Call
        </button>
      </div>
    </div>
  );
}
