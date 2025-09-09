<template>
  <v-container fluid class="call-container pa-0">
    <!-- Video Area -->
    <div class="video-area d-flex justify-center align-center">
      <!-- Remote Video -->
      <video
        v-if="remoteVideoReady"
        ref="remoteVideo"
        autoplay
        playsinline
        class="remote-video"
      ></video>

      <!-- Local Video PiP -->
      <video
        v-if="localVideoReady"
        ref="localVideo"
        autoplay
        muted
        playsinline
        class="local-video"
      ></video>
    </div>

    <!-- Bottom Controls -->
<div class="controls-bar d-flex justify-center align-center">
  <v-btn icon class="control-btn" @click="toggleMic">
    <v-icon class="control-icon">{{ micOn ? "mdi-microphone" : "mdi-microphone-off" }}</v-icon>
  </v-btn>

  <v-btn icon class="control-btn" @click="toggleVideo">
    <v-icon class="control-icon">{{ videoOn ? "mdi-video" : "mdi-video-off" }}</v-icon>
  </v-btn>

  <v-btn icon class="hangup-btn" @click="endCall">
    <v-icon class="control-icon">mdi-phone-hangup</v-icon>
  </v-btn>

  <v-btn icon class="control-btn" @click="chatOpen = !chatOpen">
    <v-icon class="control-icon">mdi-chat</v-icon>
  </v-btn>
</div>

    <!-- Chat Sidebar -->
    <v-slide-x-reverse-transition>
      <v-card v-if="chatOpen" class="chat-sidebar">
        <v-card-title>
          Chat
          <v-spacer></v-spacer>
          <v-btn icon @click="chatOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="chat-messages">
          <div v-for="(msg, index) in messages" :key="index">
            <strong>{{ msg.sender }}:</strong> {{ msg.text }}
          </div>
        </v-card-text>

        <v-card-actions>
          <v-text-field
            v-model="newMessage"
            placeholder="Type a message"
            @keyup.enter="sendMessage"
            dense
          ></v-text-field>
          <v-btn color="orange" dark @click="sendMessage">Send</v-btn>
        </v-card-actions>
      </v-card>
    </v-slide-x-reverse-transition>

    <!-- Call Info -->
    <v-card class="call-info pa-2">
      <div><strong>Topic:</strong> {{ topic }}</div>
      <div><strong>Status:</strong> {{ connectionStatus }}</div>
    </v-card>
  </v-container>
</template>

<script>
import { initSocket } from "../services/socket";

export default {
  name: "CallPage",
  data() {
    return {
      socket: null,
      peerConnection: null,
      localStream: null,
      messages: [],
      newMessage: "",
      callId: this.$route.params.callId,
      partnerId: this.$route.query.partnerId,
      topic: this.$route.query.topic,
      connectionStatus: "Connecting...",
      remoteVideoActive: false,
      localVideoReady: false,
      remoteVideoReady: false,
      isInitiator: this.$route.query.isInitiator === "true",

      // UI controls
      micOn: true,
      videoOn: true,
      chatOpen: false,
    };
  },
  computed: {
    userId() {
      return this.$store.state.user?._id;
    },
  },
  async mounted() {
    this.socket = initSocket();
    if (!this.socket || !this.userId) {
      console.error("Socket not initialized or user not authenticated");
      this.$router.push("/login");
      return;
    }

    this.registerSocketEvents();
    this.socket.emit("joinCall", {
      callId: this.callId,
      userId: this.userId,
      isInitiator: this.isInitiator,
    });
    await this.startCall();
  },
  beforeUnmount() {
    this.cleanup();
  },
  methods: {
    async startCall() {
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        this.localVideoReady = true;

        this.$nextTick(() => {
          if (this.$refs.localVideo) {
            this.$refs.localVideo.srcObject = this.localStream;
          }
        });

        const configuration = {
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        };
        this.peerConnection = new RTCPeerConnection(configuration);

        this.localStream.getTracks().forEach((track) =>
          this.peerConnection.addTrack(track, this.localStream)
        );

        this.peerConnection.ontrack = (event) => {
          this.remoteVideoReady = true;
          this.$nextTick(() => {
            if (this.$refs.remoteVideo) {
              this.$refs.remoteVideo.srcObject = event.streams[0];
              this.connectionStatus = "Connected";
            }
          });
        };

        this.peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            this.socket.emit("iceCandidate", {
              callId: this.callId,
              candidate: event.candidate,
              to: this.partnerId,
            });
          }
        };

        if (this.isInitiator) {
          const offer = await this.peerConnection.createOffer();
          await this.peerConnection.setLocalDescription(offer);
          this.socket.emit("offer", {
            callId: this.callId,
            offer,
            to: this.partnerId,
          });
        }
      } catch (error) {
        console.error("Error starting call:", error);
      }
    },

    registerSocketEvents() {
      this.socket.on("offer", async ({ callId, offer }) => {
        if (callId !== this.callId) return;
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.socket.emit("answer", {
          callId: this.callId,
          answer,
          to: this.partnerId,
        });
      });

      this.socket.on("answer", async ({ callId, answer }) => {
        if (callId !== this.callId) return;
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      });

      this.socket.on("iceCandidate", async ({ callId, candidate }) => {
        if (callId !== this.callId || !candidate) return;
        await this.peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      });

      this.socket.on("chatMessage", (data) => {
        if (data.callId === this.callId && data.sender !== this.userId) {
          this.messages.push({ sender: "Partner", text: data.text });
        }
      });

      this.socket.on("callEnded", () => {
        alert("Call ended by partner");
        this.cleanup();
        this.$router.push({
          path: "/rate",
          query: { partnerId: this.partnerId },
        });
      });
    },

    sendMessage() {
      if (!this.newMessage.trim()) return;
      this.messages.push({ sender: "You", text: this.newMessage });
      this.socket.emit("chatMessage", {
        callId: this.callId,
        sender: this.userId,
        text: this.newMessage,
      });
      this.newMessage = "";
    },

    endCall() {
      this.socket.emit("endCall", { callId: this.callId, userId: this.userId });
      this.cleanup();
      this.$router.push({
        path: "/rate",
        query: { partnerId: this.partnerId },
      });
    },

    cleanup() {
      if (this.localStream)
        this.localStream.getTracks().forEach((track) => track.stop());
      if (this.peerConnection) this.peerConnection.close();
      if (this.socket) this.socket.disconnect();
    },

    toggleMic() {
      if (!this.localStream) return;
      this.micOn = !this.micOn;
      this.localStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = this.micOn));
    },

    toggleVideo() {
      if (!this.localStream) return;
      this.videoOn = !this.videoOn;
      this.localStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = this.videoOn));
    },
  },
};
</script>

<style scoped>
.call-container {
  background-color: #1e1e1e;
  color: white;
  height: 100vh;
  position: relative;
}

.video-area {
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
}

.remote-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: black;
}

.local-video {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 200px;
  height: 150px;
  object-fit: cover;
  border: 2px solid white;
  border-radius: 8px;
}

.controls-bar {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  padding: 8px 12px;
  border-radius: 30px;
}

.chat-sidebar {
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background-color: #fff;
  color: black;
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.call-info {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 6px 12px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
}
/* Ensure icons are visible */
.control-btn {
  background-color: rgba(255, 255, 255, 0.1);
  margin: 0 6px;
}

.control-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.control-icon {
  color: white !important;
  font-size: 28px;
}

.hangup-btn {
  background-color: #e53935 !important; /* red button */
  margin: 0 6px;
}

.hangup-btn:hover {
  background-color: #d32f2f !important;
}

</style>
