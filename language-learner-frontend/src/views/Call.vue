<template>
  <v-container fluid class="pa-0 fill-height">
    <v-row no-gutters class="fill-height">
      <!-- Video Section -->
      <v-col cols="12" md="8" class="d-flex flex-column align-center justify-center grey lighten-4">
        <v-row class="fill-height" align="center" justify="center">
          <v-col cols="6" class="pa-1">
            <video ref="localVideo" autoplay playsinline muted class="rounded-lg" style="width: 100%; height: auto;" />
            <p class="text-center caption grey--text">You</p>
          </v-col>
          <v-col cols="6" class="pa-1">
            <video ref="remoteVideo" autoplay playsinline class="rounded-lg" style="width: 100%; height: auto;" />
            <p class="text-center caption grey--text">Partner</p>
          </v-col>
        </v-row>
        <v-btn color="red darken-2" dark class="mt-4" @click="endCall">
          <v-icon left>mdi-phone-hangup</v-icon> End Call
        </v-btn>
      </v-col>

      <!-- Chat Section -->
      <v-col cols="12" md="4" class="d-flex flex-column">
        <v-card flat class="flex-grow-1">
          <v-card-title class="headline grey lighten-3">Chat</v-card-title>
          <v-card-text ref="chatBox" class="overflow-y-auto" style="max-height: 70vh;">
            <div v-for="(msg, index) in messages" :key="index" class="my-2">
              <strong>{{ msg.user }}:</strong> {{ msg.text }}
            </div>
          </v-card-text>
        </v-card>

        <v-card flat class="pa-2 grey lighten-4">
          <v-text-field
            v-model="newMessage"
            label="Type a message..."
            dense
            outlined
            @keyup.enter="sendMessage"
          />
          <v-btn color="orange darken-2" dark @click="sendMessage">
            <v-icon left>mdi-send</v-icon> Send
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import socket from "../services/socket";
import api from "../services/api";

export default {
  name: "CallPage",
  data: () => ({
    peerConnection: null,
    localStream: null,
    remoteStream: null,
    messages: [],
    newMessage: "",
  }),
  async mounted() {
    await this.startCall();

    // Chat listener
    socket.on("chatMessage", (msg) => {
      this.messages.push(msg);
      this.$nextTick(() => {
        this.$refs.chatBox.scrollTop = this.$refs.chatBox.scrollHeight;
      });
    });
  },
  methods: {
    async startCall() {
      try {
        // Get ICE servers
        const { data } = await api.get("/ice-servers");
        const configuration = { iceServers: data.iceServers };

        this.peerConnection = new RTCPeerConnection(configuration);

        // Local stream
        this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        this.$refs.localVideo.srcObject = this.localStream;
        this.localStream.getTracks().forEach((track) => {
          this.peerConnection.addTrack(track, this.localStream);
        });

        // Remote stream
        this.remoteStream = new MediaStream();
        this.$refs.remoteVideo.srcObject = this.remoteStream;
        this.peerConnection.ontrack = (event) => {
          event.streams[0].getTracks().forEach((track) => {
            this.remoteStream.addTrack(track);
          });
        };

        // ICE candidates
        this.peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("iceCandidate", event.candidate);
          }
        };

        // Socket listeners
        socket.on("offer", async (offer) => {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          socket.emit("answer", answer);
        });

        socket.on("answer", async (answer) => {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on("iceCandidate", async (candidate) => {
          try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error("Error adding ICE candidate:", err);
          }
        });

        // Create & send offer
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        socket.emit("offer", offer);
      } catch (err) {
        console.error("Error starting call:", err);
      }
    },
    sendMessage() {
      if (!this.newMessage.trim()) return;
      const msg = { user: "You", text: this.newMessage };
      this.messages.push(msg);
      socket.emit("chatMessage", msg);
      this.newMessage = "";
      this.$nextTick(() => {
        this.$refs.chatBox.scrollTop = this.$refs.chatBox.scrollHeight;
      });
    },
    endCall() {
      if (this.peerConnection) {
        this.peerConnection.close();
      }
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
      }
      this.$router.push("/match");
    },
  },
};
</script>
