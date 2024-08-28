<template>
  <div id="session">
    <div class="largeTitle">ENTER THE ROOM</div>
      <div class="container">
        <div id="video-container" class="col-md-6">
          <user-video :stream-manager="publisher" @click.native="updateMainVideoStreamManager(publisher)" />
          <user-video v-for="sub in subscribers" :key="sub.stream.connection.connectionId" :stream-manager="sub"
            @click.native="updateMainVideoStreamManager(sub)" />
        </div>
      <div class="controls-container">
        <div id="session-header">
          <h1 id="session-title">{{ sessionId }}</h1>
          <input class="btn btn-large btn-danger" type="button" id="buttonLeaveSession" @click="leaveSession"
            value="Leave session" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { OpenVidu } from "openvidu-browser";
import UserVideo from "@/components/video/UserVideo";

axios.defaults.headers.post["Content-Type"] = "application/json";

const APPLICATION_SERVER_URL = 'https://4cutstudio.store/';

export default {
  name: "EnterPage",
  components: {
    UserVideo,
  },
  data() {
    return {
      OV: undefined,
      session: undefined,
      mainStreamManager: undefined,
      publisher: undefined,
      subscribers: [],
      sessionId: this.$route.query.sessionId,
      userName: this.$route.query.userName,
      participantCount: this.$route.query.participantCount,

    };
  },
  methods: {
    joinSession() {
      this.OV = new OpenVidu();
      this.session = this.OV.initSession();

      this.session.on("streamCreated", ({ stream }) => {
        const subscriber = this.session.subscribe(stream);
        this.subscribers.push(subscriber);
      });

      this.session.on("streamDestroyed", ({ stream }) => {
        const index = this.subscribers.indexOf(stream.streamManager, 0);
        if (index >= 0) {
          this.subscribers.splice(index, 1);
        }
      });

      this.session.on("exception", ({ exception }) => {
        console.warn(exception);
      });

      this.getToken(this.sessionId).then((token) => {
        this.session.connect(token, { clientData: this.userName })
          .then(() => {
            let publisher = this.OV.initPublisher(undefined, {
              audioSource: undefined,
              videoSource: undefined,
              publishAudio: true,
              publishVideo: true,
              resolution: "480x600",
              frameRate: 30,
              insertMode: "APPEND",
              mirror: false,
            });

            this.mainStreamManager = publisher;
            this.publisher = publisher;

            this.session.publish(this.publisher);
          })
          .catch((error) => {
            console.log("There was an error connecting to the session:", error.code, error.message);
          });
      });

      window.addEventListener("beforeunload", this.leaveSession);
    },

    leaveSession() {
      if (this.session) this.session.disconnect();
      this.session = undefined;
      this.mainStreamManager = undefined;
      this.publisher = undefined;
      this.subscribers = [];
      this.OV = undefined;
      window.removeEventListener("beforeunload", this.leaveSession);
    },

    updateMainVideoStreamManager(stream) {
      if (this.mainStreamManager === stream) return;
      this.mainStreamManager = stream;
    },

    async getToken(sessionId) {
      const sessionIdFromServer = await this.createSession(sessionId);
      return await this.createToken(sessionIdFromServer);
    },

    async createSession(sessionId) {
      const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions', { customSessionId: sessionId }, {
        headers: { 'Content-Type': 'application/json', },
      });
      return response.data; // The sessionId from the server
    },

    async createToken(sessionIdFromServer) {
      const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions/' + sessionIdFromServer + '/connections', {}, {
        headers: { 'Content-Type': 'application/json', },
      });
      return response.data; // The token
    },
  },
  created() {
    this.joinSession();
  },
};
</script>

<style scoped>
.container {
  width: 100%;
  height: auto;
  display: flex; 
  justify-content: space-between;
}

.video-container {
  width: 70%
}

.controls-container {
  width: 30%;
}
</style>
