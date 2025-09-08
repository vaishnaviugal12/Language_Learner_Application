<template>
  <v-container fluid class="call-container pa-0">
    <!-- Video Area -->
    <div class="video-area">
      <!-- Local Video -->
      <video
        v-if="localVideoReady"
        ref="localVideo"
        autoplay
        muted
        playsinline
        class="video-box"
      ></video>

      <!-- Remote Video -->
      <video
        v-if="remoteVideoReady"
        ref="remoteVideo"
        autoplay
        playsinline
        class="video-box"
      ></video>
    </div>

    <!-- Bottom Controls -->
    <v-row class="controls-bar" justify="center" align="center">
      <v-btn icon @click="toggleMic" :color="micOn ? 'orange darken-2' : 'grey'">
        <v-icon>{{ micOn ? 'mdi-microphone' : 'mdi-microphone-off' }}</v-icon>
      </v-btn>

      <v-btn icon @click="toggleVideo" :color="videoOn ? 'orange darken-2' : 'grey'">
        <v-icon>{{ videoOn ? 'mdi-video' : 'mdi-video-off' }}</v-icon>
      </v-btn>

      <v-btn icon color="red darken-2" @click="endCall">
        <v-icon>mdi-phone-hangup</v-icon>
      </v-btn>

      <v-btn icon @click="chatOpen = !chatOpen" color="orange darken-2">
        <v-icon>mdi-chat</v-icon>
      </v-btn>
    </v-row>

    <!-- Chat Sidebar -->
    <v-slide-x-reverse-transition>
      <v-card v-if="chatOpen" class="chat-sidebar elevation-12">
        <!-- Chat Header -->
        <v-toolbar dense flat color="orange darken-2">
          <v-toolbar-title class="white--text">Chat</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="chatOpen = false">
            <v-icon class="white--text">mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <!-- Messages -->
        <v-card-text class="chat-messages">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['chat-bubble', msg.sender === 'You' ? 'sent' : 'received']"
          >
            <span>{{ msg.text }}</span>
          </div>
        </v-card-text>

        <!-- Input -->
        <v-divider></v-divider>
        <v-card-actions class="chat-input">
          <v-text-field
            v-model="newMessage"
            placeholder="Type a message"
            @keyup.enter="sendMessage"
            dense
            outlined
            hide-details
            color="orange"
            class="flex-grow-1"
          ></v-text-field>
          <v-btn color="orange darken-2" dark @click="sendMessage">Send</v-btn>
        </v-card-actions>
      </v-card>
    </v-slide-x-reverse-transition>

    <!-- Call Info -->
    <v-card class="call-info pa-2 elevation-8">
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
      remoteVideoReady: false,
      localVideoReady: false,
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
        this.socket.emit("answer", { callId: this.callId, answer, to: this.partnerId });
      });

      this.socket.on("answer", async ({ callId, answer }) => {
        if (callId !== this.callId) return;
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      });

      this.socket.on("iceCandidate", async ({ callId, candidate }) => {
        if (callId !== this.callId || !candidate) return;
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      });

      this.socket.on("chatMessage", (data) => {
        if (data.callId === this.callId && data.sender !== this.userId) {
          this.messages.push({ sender: "Partner", text: data.text });
        }
      });

      this.socket.on("callEnded", () => {
        alert("Call ended by partner");
        this.cleanup();
        this.$router.push("/");
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
      this.$router.push("/");
    },

    cleanup() {
      if (this.localStream) this.localStream.getTracks().forEach((track) => track.stop());
      if (this.peerConnection) this.peerConnection.close();
      if (this.socket) this.socket.disconnect();
    },

    toggleMic() {
      if (!this.localStream) return;
      this.micOn = !this.micOn;
      this.localStream.getAudioTracks().forEach((track) => (track.enabled = this.micOn));
    },

    toggleVideo() {
      if (!this.localStream) return;
      this.videoOn = !this.videoOn;
      this.localStream.getVideoTracks().forEach((track) => (track.enabled = this.videoOn));
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
  overflow: hidden;
}

.video-area {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px; /* space between videos */
  width: 80%;
  max-width: 1200px;
  height: 60%;
  margin: 60px auto 0; /* margin from top and centered */
}

.video-box {
  flex: 1;
  max-width: 45%; /* each video takes ~45% of container */
  height: 100%;
  object-fit: cover;
  border: 2px solid #ff9800;
  border-radius: 12px;
}

.controls-bar {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(30, 30, 30, 0.85);
  border-radius: 50px;
  padding: 10px 20px;
  z-index: 10;
}

/* Chat Styles */
.chat-sidebar {
  position: absolute;
  top: 0;
  right: 0;
  width: 320px;
  height: 100%;
  background-color: #ffffff; /* white background */
  display: flex;
  flex-direction: column;
  z-index: 20;
  border-left: 3px solid #ff9800;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.chat-bubble {
  max-width: 75%;
  padding: 10px 15px;
  margin: 5px 0;
  border-radius: 20px;
  word-wrap: break-word;
}

.sent {
  align-self: flex-end;
  background-color: #ff9800; /* orange bubble */
  color: black; /* black text */
  border-bottom-right-radius: 0;
}

.received {
  align-self: flex-start;
  background-color: #e0e0e0; /* light grey bubble */
  color: black;
  border-bottom-left-radius: 0;
}

.chat-input {
  padding: 8px 10px;
  display: flex;
  align-items: center;
}

.call-info {
  position: absolute;
  top: 15px;
  left: 15px;
  background-color: rgba(30, 30, 30, 0.8);
  padding: 8px 15px;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  z-index: 10;
}
</style>
